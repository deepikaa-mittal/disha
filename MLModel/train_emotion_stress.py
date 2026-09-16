"""
Production-Ready Training Pipeline for Emotion and Stress-Level Prediction
Dataset: EEG Brainwave Emotion Dataset (emotions.csv)

This script implements an end-to-end Machine Learning pipeline:
  1. Data Loading and Cleaning (header formatting, missing/inf values detection)
  2. Feature Engineering & Preprocessing (variance filtering, feature grouping)
  3. Stratified Train-Validation-Test Splitting & 5-Fold Cross-Validation
  4. Model Training & Class Imbalance Handling
  5. Multi-faceted Evaluation:
     - Emotion Prediction (POSITIVE, NEUTRAL, NEGATIVE)
     - Stress-Level Prediction (Low, Moderate, High)
     - Accuracy, Precision (macro & weighted), Recall, F1-Score, Confusion Matrices
  6. Inference Latency Benchmarking
  7. Optimized Model & Preprocessor Serialization (compressed joblib + metadata JSON)
"""

import argparse
import json
import os
import sys
import time

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_selection import VarianceThreshold
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)
from sklearn.model_selection import StratifiedKFold, cross_val_predict, train_test_split

# Mapping from EEG Emotion to Clinical/Psychological Stress Category
# NEGATIVE valence + high distress -> High Stress
# NEUTRAL baseline -> Moderate Stress
# POSITIVE valence + calm/joy -> Low Stress
EMOTION_TO_STRESS = {
    "POSITIVE": "Low",
    "NEUTRAL": "Moderate",
    "NEGATIVE": "High",
}

STRESS_CATEGORIES = ["Low", "Moderate", "High"]
EMOTION_CATEGORIES = ["NEGATIVE", "NEUTRAL", "POSITIVE"]


class EmotionStressTrainer:
    """End-to-end trainer and evaluator for Emotion and Stress prediction."""

    def __init__(
        self,
        data_path: str = "emotions.csv",
        models_dir: str = "models",
        test_size: float = 0.20,
        random_state: int = 42,
        n_estimators: int = 120,
        max_depth: int = 16,
    ):
        self.data_path = data_path
        self.models_dir = models_dir
        self.test_size = test_size
        self.random_state = random_state
        self.n_estimators = n_estimators
        self.max_depth = max_depth

        self.df = None
        self.feature_cols = []
        self.model = None
        self.selector = None
        self.metadata = {}

    def load_and_clean_data(self) -> pd.DataFrame:
        """Load dataset, strip corrupted header characters, and check integrity."""
        print(f"\n[1/6] Loading dataset from '{self.data_path}'...")
        t0 = time.time()
        if not os.path.exists(self.data_path):
            raise FileNotFoundError(f"Dataset not found at: {self.data_path}")

        df = pd.read_csv(self.data_path)
        load_time = time.time() - t0
        print(f"      Loaded {df.shape[0]:,} rows and {df.shape[1]:,} columns in {load_time:.2f}s")

        # Clean column names (strip whitespace and leading '#' or comments)
        clean_cols = [col.strip().lstrip("#").strip() for col in df.columns]
        df.columns = clean_cols

        target_col = "label"
        if target_col not in df.columns:
            raise KeyError(f"Expected target column '{target_col}' not found in dataset columns.")

        # Data integrity check
        feature_df = df.drop(columns=[target_col])
        null_count = int(feature_df.isnull().sum().sum())
        inf_count = int(np.isinf(feature_df.select_dtypes(include=np.number).to_numpy()).sum())

        print(f"      Data Quality Check: {null_count} NaNs, {inf_count} Infs detected.")
        if null_count > 0:
            print("      Imputing missing values using column medians...")
            df = df.fillna(df.median(numeric_only=True))

        # Check label distribution
        label_counts = df[target_col].value_counts().to_dict()
        print(f"      Label distribution: {label_counts}")

        self.df = df
        self.feature_cols = [c for c in df.columns if c != target_col]
        return df

    def preprocess_features(self, X: pd.DataFrame, is_training: bool = True):
        """Remove zero-variance features if any and prepare feature matrix."""
        if is_training:
            self.selector = VarianceThreshold(threshold=0.0)
            X_clean = self.selector.fit_transform(X)
            retained_mask = self.selector.get_support()
            self.feature_cols = [col for col, keep in zip(self.feature_cols, retained_mask) if keep]
            dropped_count = len(retained_mask) - len(self.feature_cols)
            print(f"[2/6] Feature Engineering: Retained {len(self.feature_cols)} features ({dropped_count} zero-variance dropped).")
            return X_clean
        else:
            return self.selector.transform(X)

    def train_and_cross_validate(self):
        """Perform 5-fold cross-validation and fit the final model."""
        X_raw = self.df[self.feature_cols]
        y_emotion = self.df["label"]
        y_stress = y_emotion.map(EMOTION_TO_STRESS)

        X_processed = self.preprocess_features(X_raw, is_training=True)

        print("\n[3/6] Running 5-Fold Stratified Cross-Validation...")
        cv_model = RandomForestClassifier(
            n_estimators=self.n_estimators,
            max_depth=self.max_depth,
            max_features="sqrt",
            class_weight="balanced",
            random_state=self.random_state,
            n_jobs=-1,
        )

        cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=self.random_state)
        cv_t0 = time.time()
        cv_preds_emotion = cross_val_predict(cv_model, X_processed, y_emotion, cv=cv, n_jobs=-1)
        cv_time = time.time() - cv_t0

        cv_acc_emotion = accuracy_score(y_emotion, cv_preds_emotion)
        cv_f1_emotion = f1_score(y_emotion, cv_preds_emotion, average="macro")

        cv_preds_stress = pd.Series(cv_preds_emotion).map(EMOTION_TO_STRESS)
        cv_acc_stress = accuracy_score(y_stress, cv_preds_stress)
        cv_f1_stress = f1_score(y_stress, cv_preds_stress, average="macro")

        print(f"      5-Fold CV Emotion Accuracy:    {cv_acc_emotion * 100:.2f}% (Macro F1: {cv_f1_emotion:.4f})")
        print(f"      5-Fold CV Stress Accuracy:     {cv_acc_stress * 100:.2f}% (Macro F1: {cv_f1_stress:.4f})")
        print(f"      Cross-Validation completed in: {cv_time:.2f}s")

        print("\n[4/6] Training Production Model on 80/20 Train-Test Split...")
        X_train, X_test, y_train_emo, y_test_emo = train_test_split(
            X_processed, y_emotion, test_size=self.test_size, random_state=self.random_state, stratify=y_emotion
        )

        self.model = RandomForestClassifier(
            n_estimators=self.n_estimators,
            max_depth=self.max_depth,
            max_features="sqrt",
            class_weight="balanced",
            random_state=self.random_state,
            n_jobs=-1,
        )

        train_t0 = time.time()
        self.model.fit(X_train, y_train_emo)
        train_duration = time.time() - train_t0
        print(f"      Model trained on {len(X_train):,} samples in {train_duration:.2f}s")

        return X_test, y_test_emo

    def evaluate(self, X_test, y_test_emo):
        """Evaluate final model on held-out test set with detailed metrics."""
        print("\n[5/6] Evaluating Model Performance on Held-Out Test Set...")
        t_eval_start = time.time()
        test_preds_emo = self.model.predict(X_test)
        eval_duration = time.time() - t_eval_start
        latency_per_sample_ms = (eval_duration / len(X_test)) * 1000.0

        y_test_stress = y_test_emo.map(EMOTION_TO_STRESS)
        test_preds_stress = pd.Series(test_preds_emo).map(EMOTION_TO_STRESS)

        # Emotion metrics
        acc_emo = accuracy_score(y_test_emo, test_preds_emo)
        prec_emo = precision_score(y_test_emo, test_preds_emo, average="macro")
        rec_emo = recall_score(y_test_emo, test_preds_emo, average="macro")
        f1_emo = f1_score(y_test_emo, test_preds_emo, average="macro")
        cm_emo = confusion_matrix(y_test_emo, test_preds_emo, labels=EMOTION_CATEGORIES).tolist()

        # Stress metrics
        acc_stress = accuracy_score(y_test_stress, test_preds_stress)
        prec_stress = precision_score(y_test_stress, test_preds_stress, average="macro")
        rec_stress = recall_score(y_test_stress, test_preds_stress, average="macro")
        f1_stress = f1_score(y_test_stress, test_preds_stress, average="macro")
        cm_stress = confusion_matrix(y_test_stress, test_preds_stress, labels=STRESS_CATEGORIES).tolist()

        print("\n" + "=" * 65)
        print("                 EMOTION PREDICTION EVALUATION")
        print("=" * 65)
        print(f"Test Accuracy:         {acc_emo * 100:.2f}%")
        print(f"Macro Precision:       {prec_emo:.4f}")
        print(f"Macro Recall:          {rec_emo:.4f}")
        print(f"Macro F1-Score:        {f1_emo:.4f}")
        print(f"Inference Latency:     {latency_per_sample_ms:.3f} ms / sample")
        print("\nClassification Report (Emotion):")
        print(classification_report(y_test_emo, test_preds_emo, digits=4))
        print("Confusion Matrix (Emotion) [Rows: True, Cols: Pred]:")
        print(pd.DataFrame(cm_emo, index=EMOTION_CATEGORIES, columns=EMOTION_CATEGORIES))

        print("\n" + "=" * 65)
        print("               STRESS LEVEL PREDICTION EVALUATION")
        print("=" * 65)
        print(f"Test Accuracy:         {acc_stress * 100:.2f}%")
        print(f"Macro Precision:       {prec_stress:.4f}")
        print(f"Macro Recall:          {rec_stress:.4f}")
        print(f"Macro F1-Score:        {f1_stress:.4f}")
        print("\nClassification Report (Stress Level):")
        print(classification_report(y_test_stress, test_preds_stress, digits=4))
        print("Confusion Matrix (Stress Level) [Rows: True, Cols: Pred]:")
        print(pd.DataFrame(cm_stress, index=STRESS_CATEGORIES, columns=STRESS_CATEGORIES))
        print("=" * 65 + "\n")

        # Top 15 Feature Importances
        importances = pd.Series(self.model.feature_importances_, index=self.feature_cols).sort_values(ascending=False)
        print("Top 15 Most Predictive EEG Features:")
        for rank, (feat, imp) in enumerate(importances.head(15).items(), 1):
            print(f"  {rank:2d}. {feat:<20s} : {imp:.5f}")

        self.metadata = {
            "model_type": "RandomForestClassifier",
            "n_estimators": self.n_estimators,
            "max_depth": self.max_depth,
            "n_features": len(self.feature_cols),
            "test_accuracy_emotion": round(float(acc_emo), 4),
            "test_macro_f1_emotion": round(float(f1_emo), 4),
            "test_accuracy_stress": round(float(acc_stress), 4),
            "test_macro_f1_stress": round(float(f1_stress), 4),
            "latency_ms_per_sample": round(float(latency_per_sample_ms), 4),
            "confusion_matrix_emotion": {
                "labels": EMOTION_CATEGORIES,
                "matrix": cm_emo,
            },
            "confusion_matrix_stress": {
                "labels": STRESS_CATEGORIES,
                "matrix": cm_stress,
            },
            "top_15_features": importances.head(15).to_dict(),
            "emotion_to_stress_mapping": EMOTION_TO_STRESS,
            "trained_at": time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime()),
        }

    def save_pipeline(self):
        """Save trained model, preprocessor, and feature schema to disk."""
        print(f"[6/6] Saving trained model and metadata to '{self.models_dir}/'...")
        os.makedirs(self.models_dir, exist_ok=True)

        pipeline_payload = {
            "model": self.model,
            "selector": self.selector,
            "feature_cols": self.feature_cols,
            "classes_": self.model.classes_.tolist(),
            "emotion_to_stress": EMOTION_TO_STRESS,
        }

        model_save_path = os.path.join(self.models_dir, "emotion_stress_model.joblib")
        # Use compression level 3 to minimize disk footprint while ensuring fast read times
        joblib.dump(pipeline_payload, model_save_path, compress=3)
        size_mb = os.path.getsize(model_save_path) / (1024 * 1024)
        print(f"      Saved model package: {model_save_path} ({size_mb:.2f} MB)")

        meta_save_path = os.path.join(self.models_dir, "metadata.json")
        with open(meta_save_path, "w") as f:
            json.dump(self.metadata, f, indent=2)
        print(f"      Saved evaluation metadata: {meta_save_path}")

        # Also save feature_cols alone for fast loading in lightweight bridges
        feat_save_path = os.path.join(self.models_dir, "feature_names.json")
        with open(feat_save_path, "w") as f:
            json.dump(self.feature_cols, f, indent=2)
        print(f"      Saved feature names: {feat_save_path}")


def run_pipeline(data_path="emotions.csv", models_dir="models"):
    trainer = EmotionStressTrainer(data_path=data_path, models_dir=models_dir)
    trainer.load_and_clean_data()
    X_test, y_test_emo = trainer.train_and_cross_validate()
    trainer.evaluate(X_test, y_test_emo)
    trainer.save_pipeline()
    print("\n Pipeline execution completed successfully!")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train Emotion and Stress Level ML Model")
    parser.add_argument("--data", type=str, default="emotions.csv", help="Path to emotions.csv")
    parser.add_argument("--out", type=str, default="models", help="Output models directory")
    args = parser.parse_args()

    run_pipeline(data_path=args.data, models_dir=args.out)
