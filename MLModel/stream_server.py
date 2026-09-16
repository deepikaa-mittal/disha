"""
Real-time streaming layer for the VR biofeedback pipeline.

What it does:
  - Loads the trained models from models/ (run train_model.py first).
  - Runs a background loop that generates one synthetic "epoch" per tick
    (default 1/sec), scores it with the models, and BROADCASTS the result
    over WebSocket to every connected client (this is what the VR/React
    frontend subscribes to for a live happiness/sadness/stress meter).
  - Exposes POST /ingest so that, later, a real EEG headset bridge script
    can push real band-power feature vectors instead of the synthetic feed
    -- same broadcast path, same message shape, so the frontend never has
    to change.

Run:
    python train_model.py     # if you haven't already (writes models/*.joblib)
    python stream_server.py   # starts on http://localhost:5000, ws://localhost:5000/ws

Test without a frontend: open test_client.html in a browser while this is running.
"""

import json
import os
import threading
import time

import joblib
import numpy as np
import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sock import Sock

from synthetic_eeg_generator import LiveStateWalker

MODELS_DIR = "models"
TICK_INTERVAL_SECONDS = 1.0

app = Flask(__name__)
CORS(app)
sock = Sock(app)

clf_emotion = joblib.load(os.path.join(MODELS_DIR, "emotion_clf.joblib"))
clf_stress = joblib.load(os.path.join(MODELS_DIR, "stress_clf.joblib"))
FEATURE_COLS = joblib.load(os.path.join(MODELS_DIR, "feature_cols.joblib"))

_clients = []
_clients_lock = threading.Lock()
_synthetic_feed_enabled = True  # POST /ingest flips this off (a real feed has taken over)
_tick_counter = 0
_walker = LiveStateWalker()
_latest_message = None  # last broadcast message, for engines that poll instead of using WebSocket


def broadcast(message: dict) -> None:
    global _latest_message
    _latest_message = message
    payload = json.dumps(message)
    with _clients_lock:
        dead = []
        for ws in _clients:
            try:
                ws.send(payload)
            except Exception:
                dead.append(ws)
        for ws in dead:
            _clients.remove(ws)


def derive_indices(frontal_asymmetry: float, beta_alpha_ratio: float) -> dict:
    """Approximate happiness/sadness/stress dashboard numbers from observable
    features alone (no hidden ground truth) -- used for the /ingest path, where
    real hardware only gives us band powers, not a known valence/arousal state."""
    arousal_proxy = float(np.clip((beta_alpha_ratio - 0.3) / 1.2, 0, 1))
    happiness = float(np.clip(50 + 35 * frontal_asymmetry + 15 * (arousal_proxy - 0.5), 0, 100))
    sadness = float(np.clip(50 - 35 * frontal_asymmetry - 15 * (arousal_proxy - 0.5), 0, 100))
    stress = float(np.clip(40 * beta_alpha_ratio - 20 + 30 * arousal_proxy, 0, 100))
    return {"happiness_index": round(happiness, 1), "sadness_index": round(sadness, 1),
            "anxiety_stress_index": round(stress, 1)}


def score_and_broadcast(feature_row: dict, indices: dict) -> dict:
    x = pd.DataFrame([[feature_row[col] for col in FEATURE_COLS]], columns=FEATURE_COLS)
    emotion_pred = clf_emotion.predict(x)[0]
    stress_pred = bool(clf_stress.predict(x)[0])
    stress_proba = float(clf_stress.predict_proba(x)[0][1])

    message = {
        "timestamp": time.time(),
        **indices,
        "predicted_emotion": emotion_pred,
        "stressed": stress_pred,
        "stress_probability": round(stress_proba, 3),
    }
    broadcast(message)
    return message


def synthetic_feed_loop():
    global _tick_counter
    while True:
        if _synthetic_feed_enabled:
            row = _walker.step()
            feature_row = {col: float(row[col]) for col in FEATURE_COLS}
            indices = {
                "happiness_index": round(float(row.happiness_index), 1),
                "sadness_index": round(float(row.sadness_index), 1),
                "anxiety_stress_index": round(float(row.anxiety_stress_index), 1),
            }
            msg = score_and_broadcast(feature_row, indices)
            _tick_counter += 1
            print(f"[tick {_tick_counter}] {msg}", flush=True)
        time.sleep(TICK_INTERVAL_SECONDS)


@app.route("/ingest", methods=["POST"])
def ingest():
    """Real (or externally-simulated) feature vector comes in here.
    Body: {"alpha_left":..., "alpha_right":..., "beta_left":..., "beta_right":...,
            "theta":..., "frontal_asymmetry":..., "beta_alpha_ratio":..., "engagement_index":...}
    Pauses the built-in synthetic feed so the two don't fight over the broadcast."""
    global _synthetic_feed_enabled
    body = request.get_json(force=True)

    missing = [c for c in FEATURE_COLS if c not in body]
    if missing:
        return jsonify({"error": f"missing fields: {missing}"}), 400

    _synthetic_feed_enabled = False
    feature_row = {col: float(body[col]) for col in FEATURE_COLS}
    indices = derive_indices(feature_row["frontal_asymmetry"], feature_row["beta_alpha_ratio"])
    msg = score_and_broadcast(feature_row, indices)
    return jsonify(msg)


@app.route("/mode", methods=["POST"])
def set_mode():
    """POST {"synthetic": true|false} to toggle the built-in demo feed back on/off."""
    global _synthetic_feed_enabled
    body = request.get_json(force=True)
    _synthetic_feed_enabled = bool(body.get("synthetic", True))
    return jsonify({"synthetic_feed_enabled": _synthetic_feed_enabled})


@app.route("/health")
def health():
    return jsonify({"status": "ok", "synthetic_feed_enabled": _synthetic_feed_enabled,
                     "connected_clients": len(_clients)})


@app.route("/latest")
def latest():
    """Polling alternative to the WebSocket feed -- for VR engines (Unity/Unreal/etc.)
    where a plain HTTP GET is much less friction than wiring up a WebSocket client.
    Poll this every 200-500ms; response shape is identical to the /ws messages."""
    if _latest_message is None:
        return jsonify({"error": "no data yet"}), 503
    return jsonify(_latest_message)


@app.route("/predict_eeg", methods=["POST"])
def predict_eeg():
    """Direct prediction endpoint using the 98.8% accuracy emotion & stress ML pipeline.
    Accepts full EEG feature vectors, partial dicts, or text payloads."""
    from predict import predict as run_predict
    body = request.get_json(force=True, silent=True)
    if body is None:
        return jsonify({"error": "Invalid or missing JSON payload"}), 400
    try:
        result = run_predict(body)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@sock.route("/ws")
def ws_handler(ws):
    with _clients_lock:
        _clients.append(ws)
    print(f"Client connected ({len(_clients)} total)")
    try:
        while True:
            ws.receive(timeout=60)  # blocks; keeps the connection open, ignores client messages
    except Exception:
        pass
    finally:
        with _clients_lock:
            if ws in _clients:
                _clients.remove(ws)
        print(f"Client disconnected ({len(_clients)} total)")


if __name__ == "__main__":
    threading.Thread(target=synthetic_feed_loop, daemon=True).start()
    print("Streaming server on http://localhost:5000")
    print("  WebSocket feed:  ws://localhost:5000/ws")
    print("  Real-data input: POST http://localhost:5000/ingest")
    print("  Toggle feed:     POST http://localhost:5000/mode  {\"synthetic\": true|false}")
    app.run(host="0.0.0.0", port=5000, debug=False)
