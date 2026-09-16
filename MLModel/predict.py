"""
Emotion and Stress-Level Prediction Engine
Module: predict.py

This module provides a production-grade inference API for predicting emotion
(POSITIVE, NEUTRAL, NEGATIVE) and stress level (Low, Moderate, High) from:
  1. EEG feature vectors (dict, list, NumPy array, pandas DataFrame/Series)
  2. Comma-separated numerical string or JSON payload
  3. Natural language text input (via a built-in sentiment & stress lexicon analyzer)

Usage:
    from predict import EmotionStressPredictor, predict

    predictor = EmotionStressPredictor.load("models/emotion_stress_model.joblib")
    result = predictor.predict(sample_features)
    print(result["predicted_emotion"], result["predicted_stress_level"])
"""

import json
import os
import re
import time
from typing import Any, Dict, List, Optional, Union

import joblib
import numpy as np
import pandas as pd

DEFAULT_MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "emotion_stress_model.joblib")

# Fallback affective keywords for natural language text inputs
NLP_AFFECT_LEXICON = {
    "high_stress": [
        "stress", "stressed", "anxious", "anxiety", "panic", "fear", "terrified", "overwhelmed",
        "burnout", "burned out", "exhausted", "distressed", "agitated", "angry", "furious",
        "depressed", "nervous", "frustrated", "screaming", "nightmare", "suffocating", "tense",
        "worried", "insomnia", "dread", "pressure", "crisis", "pain", "sad", "sadness", "crying"
    ],
    "moderate_stress": [
        "okay", "fine", "normal", "average", "busy", "working", "routine", "studying",
        "neutral", "alert", "focused", "task", "meeting", "moderate", "reading", "thinking",
        "balanced", "standard", "waiting", "attentive", "steady"
    ],
    "low_stress": [
        "calm", "relaxed", "peaceful", "happy", "joy", "joyful", "content", "serene",
        "chill", "great", "wonderful", "delighted", "rested", "recharged", "tranquil",
        "meditating", "blissful", "relieved", "smiling", "excited", "positive", "safe"
    ]
}


class EmotionStressPredictor:
    """Production predictor for Emotion and Stress Level classification."""

    def __init__(self, model_payload: Dict[str, Any]):
        self.model = model_payload["model"]
        # Use single-thread execution for low-latency per-sample inference (avoids multiprocessing thread dispatch overhead on Windows)
        if hasattr(self.model, "n_jobs"):
            self.model.n_jobs = 1

        self.selector = model_payload.get("selector")
        self.feature_cols: List[str] = model_payload["feature_cols"]
        self.classes: List[str] = model_payload["classes_"]
        self.emotion_to_stress: Dict[str, str] = model_payload.get(
            "emotion_to_stress",
            {"POSITIVE": "Low", "NEUTRAL": "Moderate", "NEGATIVE": "High"}
        )

        # Precompute median/fallback vector for handling partial dictionary inputs
        self.feature_index_map = {feat: idx for idx, feat in enumerate(self.feature_cols)}
        self.n_features = len(self.feature_cols)

    @classmethod
    def load(cls, model_path: str = DEFAULT_MODEL_PATH) -> "EmotionStressPredictor":
        """Load trained model package from joblib archive."""
        if not os.path.exists(model_path):
            raise FileNotFoundError(
                f"Model file not found at '{model_path}'. "
                f"Please run 'python train_emotion_stress.py' first."
            )
        payload = joblib.load(model_path)
        return cls(payload)

    def _predict_nlp_text(self, text: str) -> Dict[str, Any]:
        """Analyze natural language text for emotion and stress level."""
        t0 = time.time()
        lower_text = text.lower()

        scores = {"High": 0.0, "Moderate": 0.0, "Low": 0.0}
        matches = {"High": [], "Moderate": [], "Low": []}

        for stress_cat, words in NLP_AFFECT_LEXICON.items():
            cat_name = "High" if "high" in stress_cat else ("Moderate" if "moderate" in stress_cat else "Low")
            for w in words:
                count = len(re.findall(r"\b" + re.escape(w) + r"\b", lower_text))
                if count > 0:
                    scores[cat_name] += count
                    matches[cat_name].append(w)

        total = sum(scores.values())
        if total == 0:
            # Default to Moderate / Neutral baseline if neutral text or no sentiment words
            probs = {"Low": 0.20, "Moderate": 0.60, "High": 0.20}
            pred_stress = "Moderate"
            pred_emotion = "NEUTRAL"
            confidence = 0.60
            stress_score = 50.0
        else:
            # Softmax-style normalization with baseline smoothing
            smoothed = {k: (v + 0.1) for k, v in scores.items()}
            s_sum = sum(smoothed.values())
            probs = {k: round(v / s_sum, 4) for k, v in smoothed.items()}
            pred_stress = max(probs, key=probs.get)
            confidence = probs[pred_stress]

            # Invert mapping: High -> NEGATIVE, Moderate -> NEUTRAL, Low -> POSITIVE
            stress_to_emotion = {"High": "NEGATIVE", "Moderate": "NEUTRAL", "Low": "POSITIVE"}
            pred_emotion = stress_to_emotion[pred_stress]
            stress_score = round((probs["High"] * 100.0 + probs["Moderate"] * 50.0), 2)

        latency = (time.time() - t0) * 1000.0
        return {
            "predicted_emotion": pred_emotion,
            "emotion_confidence": round(float(confidence), 4),
            "predicted_stress_level": pred_stress,
            "stress_score": stress_score,
            "probabilities": {
                "NEGATIVE": probs.get("High", 0.0),
                "NEUTRAL": probs.get("Moderate", 0.0),
                "POSITIVE": probs.get("Low", 0.0),
            },
            "stress_probabilities": probs,
            "input_type": "natural_language_text",
            "matched_keywords": matches,
            "inference_latency_ms": round(latency, 3),
        }

    def _parse_input_to_matrix(self, input_data: Any) -> np.ndarray:
        """Convert diverse input types (dict, list, string, DataFrame) into 2D NumPy array."""
        # 1. Pandas DataFrame
        if isinstance(input_data, pd.DataFrame):
            # Align columns
            df = input_data.copy()
            clean_cols = [c.strip().lstrip("#").strip() for c in df.columns]
            df.columns = clean_cols
            missing = [c for c in self.feature_cols if c not in df.columns]
            for col in missing:
                df[col] = 0.0
            return df[self.feature_cols].to_numpy(dtype=np.float64)

        # 2. Pandas Series
        if isinstance(input_data, pd.Series):
            clean_s = {k.strip().lstrip("#").strip(): v for k, v in input_data.to_dict().items()}
            row = np.zeros(self.n_features, dtype=np.float64)
            for feat, idx in self.feature_index_map.items():
                row[idx] = float(clean_s.get(feat, 0.0))
            return row.reshape(1, -1)

        # 3. Python Dictionary
        if isinstance(input_data, dict):
            row = np.zeros(self.n_features, dtype=np.float64)
            clean_dict = {k.strip().lstrip("#").strip(): v for k, v in input_data.items()}
            for feat, idx in self.feature_index_map.items():
                row[idx] = float(clean_dict.get(feat, 0.0))
            return row.reshape(1, -1)

        # 4. List or NumPy array
        if isinstance(input_data, (list, np.ndarray)):
            arr = np.asarray(input_data, dtype=np.float64)
            if arr.ndim == 1:
                if len(arr) == self.n_features:
                    return arr.reshape(1, -1)
                elif len(arr) < self.n_features:
                    # Pad missing with zeros
                    padded = np.zeros(self.n_features, dtype=np.float64)
                    padded[: len(arr)] = arr
                    return padded.reshape(1, -1)
                else:
                    return arr[: self.n_features].reshape(1, -1)
            elif arr.ndim == 2:
                if arr.shape[1] == self.n_features:
                    return arr
                elif arr.shape[1] < self.n_features:
                    padded = np.zeros((arr.shape[0], self.n_features), dtype=np.float64)
                    padded[:, : arr.shape[1]] = arr
                    return padded
                else:
                    return arr[:, : self.n_features]

        # 5. String input (JSON, CSV, or Text)
        if isinstance(input_data, str):
            trimmed = input_data.strip()
            # Try JSON parsing
            if (trimmed.startswith("{") and trimmed.endswith("}")) or (trimmed.startswith("[") and trimmed.endswith("]")):
                try:
                    parsed = json.loads(trimmed)
                    return self._parse_input_to_matrix(parsed)
                except Exception:
                    pass

            # Try Comma/Space-separated numeric string
            if re.match(r"^[\d\s,eE\.\-\+]+$", trimmed) and ("," in trimmed or " " in trimmed):
                try:
                    delimiters = r"[,\s]+"
                    nums = [float(x) for x in re.split(delimiters, trimmed) if x]
                    return self._parse_input_to_matrix(nums)
                except Exception:
                    pass

            # If not numbers, signal text
            return None

        raise TypeError(f"Unsupported input type: {type(input_data)}")

    def predict(self, input_data: Any) -> Dict[str, Any]:
        """
        Predict emotion and stress level for a single input.

        Parameters:
            input_data: dict, list, numpy array, DataFrame row, CSV string, or text.

        Returns:
            Dict containing predicted_emotion, predicted_stress_level, stress_score,
            confidence, probability breakdown, and inference latency.
        """
        # If input is natural language text
        if isinstance(input_data, str):
            # Check if it's text vs numeric
            parsed = self._parse_input_to_matrix(input_data)
            if parsed is None:
                return self._predict_nlp_text(input_data)
            X = parsed
        else:
            X = self._parse_input_to_matrix(input_data)

        t0 = time.time()
        import warnings
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            # Preprocessing transform if selector exists
            if self.selector is not None:
                X_proc = self.selector.transform(X)
            else:
                X_proc = X

            # Compute probabilities once (evaluating trees once, avoiding redundant predict call)
            probs = self.model.predict_proba(X_proc)[0]

        best_idx = int(np.argmax(probs))
        pred_emotion = self.classes[best_idx]
        latency = (time.time() - t0) * 1000.0

        # Map class probabilities
        prob_dict = {cls_name: round(float(p), 4) for cls_name, p in zip(self.classes, probs)}
        emotion_conf = prob_dict[pred_emotion]

        # Stress level mapping
        pred_stress = self.emotion_to_stress.get(pred_emotion, "Moderate")

        # Stress probabilities and continuous stress index (0 - 100)
        p_neg = prob_dict.get("NEGATIVE", 0.0)
        p_neu = prob_dict.get("NEUTRAL", 0.0)
        p_pos = prob_dict.get("POSITIVE", 0.0)

        stress_probs = {
            "High": p_neg,
            "Moderate": p_neu,
            "Low": p_pos,
        }

        # Continuous stress score: 100% for full negative, 50% for neutral, 0% for positive
        stress_score = round(float(p_neg * 100.0 + p_neu * 50.0 + p_pos * 0.0), 2)

        return {
            "predicted_emotion": pred_emotion,
            "emotion_confidence": round(float(emotion_conf), 4),
            "predicted_stress_level": pred_stress,
            "stress_score": stress_score,
            "probabilities": prob_dict,
            "stress_probabilities": stress_probs,
            "input_type": "eeg_features",
            "inference_latency_ms": round(latency, 3),
        }

    def predict_batch(self, batch_data: Union[pd.DataFrame, np.ndarray, List[Any]]) -> List[Dict[str, Any]]:
        """Run vectorized batch inference on multiple samples."""
        X = self._parse_input_to_matrix(batch_data)
        import warnings
        t0 = time.time()
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            if self.selector is not None:
                X_proc = self.selector.transform(X)
            else:
                X_proc = X

            probs_all = self.model.predict_proba(X_proc)

        total_latency = (time.time() - t0) * 1000.0
        avg_latency = total_latency / len(probs_all)

        results = []
        for i in range(len(probs_all)):
            probs = probs_all[i]
            best_idx = int(np.argmax(probs))
            pred_emotion = self.classes[best_idx]
            prob_dict = {cls_name: round(float(p), 4) for cls_name, p in zip(self.classes, probs)}
            pred_stress = self.emotion_to_stress.get(pred_emotion, "Moderate")

            p_neg = prob_dict.get("NEGATIVE", 0.0)
            p_neu = prob_dict.get("NEUTRAL", 0.0)
            p_pos = prob_dict.get("POSITIVE", 0.0)

            stress_score = round(float(p_neg * 100.0 + p_neu * 50.0 + p_pos * 0.0), 2)

            results.append({
                "predicted_emotion": pred_emotion,
                "emotion_confidence": prob_dict[pred_emotion],
                "predicted_stress_level": pred_stress,
                "stress_score": stress_score,
                "probabilities": prob_dict,
                "stress_probabilities": {
                    "High": p_neg,
                    "Moderate": p_neu,
                    "Low": p_pos,
                },
                "inference_latency_ms": round(avg_latency, 3),
            })
        return results


# Global singleton instance for convenient one-line calling
_global_predictor: Optional[EmotionStressPredictor] = None


def predict(input_data: Any, model_path: str = DEFAULT_MODEL_PATH) -> Dict[str, Any]:
    """Convenient standalone function to predict emotion and stress level."""
    global _global_predictor
    if _global_predictor is None:
        _global_predictor = EmotionStressPredictor.load(model_path)
    return _global_predictor.predict(input_data)


if __name__ == "__main__":
    print("=" * 65)
    print("      DEMONSTRATION: EMOTION & STRESS-LEVEL PREDICTION API")
    print("=" * 65)

    if not os.path.exists(DEFAULT_MODEL_PATH):
        print(f"Model not found at '{DEFAULT_MODEL_PATH}'.")
        print("Please run: python train_emotion_stress.py")
        sys.exit(1)

    predictor = EmotionStressPredictor.load()
    print(f" Loaded model with {predictor.n_features} features.\n")

    # 1. Test using actual rows from emotions.csv
    if os.path.exists("emotions.csv"):
        print("[Demo 1] Testing on Real EEG Rows from emotions.csv:")
        df_sample = pd.read_csv("emotions.csv", nrows=6)
        clean_cols = [c.strip().lstrip("#").strip() for c in df_sample.columns]
        df_sample.columns = clean_cols

        for idx, row in df_sample.iterrows():
            actual_label = row["label"]
            features = row.drop("label").to_dict()
            res = predictor.predict(features)
            print(
                f"  Sample #{idx + 1:02d} | Actual: {actual_label:<9s} -> "
                f"Predicted Emotion: {res['predicted_emotion']:<9s} "
                f"(conf: {res['emotion_confidence']:.2f}) | "
                f"Stress Level: {res['predicted_stress_level']:<8s} "
                f"(Score: {res['stress_score']:5.1f}%) | "
                f"Latency: {res['inference_latency_ms']:.2f}ms"
            )

    # 2. Test natural language text input
    print("\n[Demo 2] Testing on Natural Language Inputs:")
    text_samples = [
        "I feel completely overwhelmed, anxious and stressed about tomorrow's exam!",
        "I had a wonderfully relaxing day at the spa with pleasant music and calm feelings.",
        "Just reviewing standard report numbers and checking routine emails.",
    ]
    for text in text_samples:
        res = predictor.predict(text)
        print(f"  Input: \"{text}\"")
        print(
            f"   -> Predicted Emotion: {res['predicted_emotion']} | "
            f"Stress: {res['predicted_stress_level']} (Score: {res['stress_score']}%) | "
            f"Latency: {res['inference_latency_ms']}ms\n"
        )

    # 3. Test Batch inference
    if os.path.exists("emotions.csv"):
        print("[Demo 3] Testing Batch Vectorized Inference (50 samples):")
        df_batch = pd.read_csv("emotions.csv", nrows=50)
        clean_cols = [c.strip().lstrip("#").strip() for c in df_batch.columns]
        df_batch.columns = clean_cols
        X_batch = df_batch.drop(columns=["label"])

        t_batch_0 = time.time()
        batch_results = predictor.predict_batch(X_batch)
        batch_time = (time.time() - t_batch_0) * 1000.0
        print(f"  Processed {len(batch_results)} samples in {batch_time:.2f}ms ({batch_time / len(batch_results):.3f}ms per sample).")
        print(f"  Batch sample 1 result: Emotion={batch_results[0]['predicted_emotion']}, Stress={batch_results[0]['predicted_stress_level']}")

    print("\n Verification of predict.py complete.")



