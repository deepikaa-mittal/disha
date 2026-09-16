"""
Trains two demo classifiers on the synthetic EEG-feature dataset:
  1. emotion_label  (4-class: happy_excited / calm_content / sad_low_energy / stressed_anxious)
  2. stress_binary  (is this person stressed right now?)

Features used are the physiologically-derived ones a real EEG pipeline would compute
(band powers + frontal asymmetry + beta/alpha ratio + engagement index) -- NOT the
happiness/sadness/stress "indices" themselves, since those were derived directly from
the labels and would make the task trivial/circular.

Also saves the trained models to models/*.joblib so stream_server.py can load
them instantly instead of retraining on every server start.

Run:
    python synthetic_eeg_generator.py   # writes eeg_synthetic_dataset.csv
    python train_model.py               # trains + evaluates + runs a live-demo loop
"""

import os
import time

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split

MODELS_DIR = "models"

FEATURE_COLS = [
    "alpha_left", "alpha_right", "beta_left", "beta_right", "theta",
    "frontal_asymmetry", "beta_alpha_ratio", "engagement_index",
]


def load_data(path="eeg_synthetic_dataset.csv") -> pd.DataFrame:
    return pd.read_csv(path)


def train_and_eval(df: pd.DataFrame, target_col: str, label_name: str):
    X = df[FEATURE_COLS]
    y = df[target_col]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )

    clf = RandomForestClassifier(n_estimators=200, max_depth=8, random_state=42)
    clf.fit(X_train, y_train)

    preds = clf.predict(X_test)
    acc = accuracy_score(y_test, preds)

    print(f"\n=== {label_name} classifier ===")
    print(f"Test accuracy: {acc:.3f}")
    print(classification_report(y_test, preds, zero_division=0))

    importances = pd.Series(clf.feature_importances_, index=FEATURE_COLS).sort_values(ascending=False)
    print("Feature importances:")
    print(importances.to_string())

    return clf


def live_demo(clf_emotion, clf_stress, df: pd.DataFrame, n_ticks: int = 8):
    """Simulate a real-time VR session streaming epochs to the model, one 'tick' at a time."""
    print("\n=== Live VR session demo (simulated real-time stream) ===")
    sample = df.sample(n=n_ticks, random_state=7).reset_index(drop=True)

    for i, row in sample.iterrows():
        x = row[FEATURE_COLS].to_frame().T
        emotion_pred = clf_emotion.predict(x)[0]
        stress_pred = clf_stress.predict(x)[0]
        stress_proba = clf_stress.predict_proba(x)[0][1]

        print(
            f"[t={i:02d}s] happiness={row.happiness_index:5.1f} "
            f"sadness={row.sadness_index:5.1f} "
            f"stress={row.anxiety_stress_index:5.1f}  "
            f"-> predicted emotion: {emotion_pred:<17s} "
            f"stressed: {'YES' if stress_pred else 'no '} (p={stress_proba:.2f})"
        )
        time.sleep(0.15)


if __name__ == "__main__":
    df = load_data()

    clf_emotion = train_and_eval(df, "emotion_label", "Emotion quadrant (4-class)")
    clf_stress = train_and_eval(df, "stress_binary", "Stress binary")

    os.makedirs(MODELS_DIR, exist_ok=True)
    joblib.dump(clf_emotion, os.path.join(MODELS_DIR, "emotion_clf.joblib"))
    joblib.dump(clf_stress, os.path.join(MODELS_DIR, "stress_clf.joblib"))
    joblib.dump(FEATURE_COLS, os.path.join(MODELS_DIR, "feature_cols.joblib"))
    print(f"\nSaved trained models to {MODELS_DIR}/")

    live_demo(clf_emotion, clf_stress, df)
