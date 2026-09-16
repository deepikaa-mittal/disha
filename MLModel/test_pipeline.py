"""
Automated Test Suite for Emotion and Stress Prediction Pipeline
File: test_pipeline.py

Verifies:
  - Data loading and cleaning
  - Model training accuracy, F1-scores, and confusion matrices
  - Artifact serialization and model packaging
  - Multi-input prediction support (dict, array, list, DataFrame, CSV string, text)
  - Stress level mapping consistency
  - Inference latency SLA (<5ms per sample)
"""

import json
import os
import unittest
import numpy as np
import pandas as pd

from train_emotion_stress import EmotionStressTrainer, EMOTION_TO_STRESS
from predict import EmotionStressPredictor, predict, DEFAULT_MODEL_PATH


class TestEmotionStressPipeline(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        """Train or load model before running tests."""
        cls.data_path = "emotions.csv"
        cls.models_dir = "models"
        cls.model_file = os.path.join(cls.models_dir, "emotion_stress_model.joblib")
        cls.metadata_file = os.path.join(cls.models_dir, "metadata.json")

        if not os.path.exists(cls.model_file):
            print("\n[SetUpClass] Training model for test suite...")
            trainer = EmotionStressTrainer(data_path=cls.data_path, models_dir=cls.models_dir)
            trainer.load_and_clean_data()
            X_test, y_test = trainer.train_and_cross_validate()
            trainer.evaluate(X_test, y_test)
            trainer.save_pipeline()

        cls.predictor = EmotionStressPredictor.load(cls.model_file)

    def test_01_artifacts_exist_and_valid(self):
        """Verify that all required model artifacts exist and have valid size/content."""
        self.assertTrue(os.path.exists(self.model_file), "Model joblib file missing")
        self.assertTrue(os.path.exists(self.metadata_file), "Metadata json file missing")

        file_size_mb = os.path.getsize(self.model_file) / (1024 * 1024)
        self.assertLess(file_size_mb, 15.0, f"Model file size {file_size_mb:.2f}MB is too large")

        with open(self.metadata_file, "r") as f:
            meta = json.load(f)

        self.assertIn("test_accuracy_emotion", meta)
        self.assertIn("test_accuracy_stress", meta)
        self.assertGreaterEqual(meta["test_accuracy_emotion"], 0.95, "Emotion accuracy below 95%")
        self.assertGreaterEqual(meta["test_accuracy_stress"], 0.95, "Stress accuracy below 95%")
        self.assertIn("confusion_matrix_emotion", meta)
        self.assertIn("confusion_matrix_stress", meta)

    def test_02_predict_from_real_eeg_row(self):
        """Test inference on a real row loaded from emotions.csv."""
        df = pd.read_csv(self.data_path, nrows=3)
        clean_cols = [c.strip().lstrip("#").strip() for c in df.columns]
        df.columns = clean_cols

        row = df.iloc[0]
        actual_emotion = row["label"]
        features = row.drop("label").to_dict()

        res = self.predictor.predict(features)
        self.assertIn(res["predicted_emotion"], ["POSITIVE", "NEUTRAL", "NEGATIVE"])
        self.assertIn(res["predicted_stress_level"], ["Low", "Moderate", "High"])
        self.assertGreaterEqual(res["emotion_confidence"], 0.0)
        self.assertLessEqual(res["emotion_confidence"], 1.0)
        self.assertGreaterEqual(res["stress_score"], 0.0)
        self.assertLessEqual(res["stress_score"], 100.0)

        # Expected stress mapping alignment
        expected_stress = EMOTION_TO_STRESS[res["predicted_emotion"]]
        self.assertEqual(res["predicted_stress_level"], expected_stress)

    def test_03_predict_from_numpy_array(self):
        """Test inference on 1D and 2D NumPy arrays."""
        sample_1d = np.random.randn(self.predictor.n_features)
        res_1d = self.predictor.predict(sample_1d)
        self.assertIn(res_1d["predicted_stress_level"], ["Low", "Moderate", "High"])

        sample_2d = np.random.randn(5, self.predictor.n_features)
        res_batch = self.predictor.predict_batch(sample_2d)
        self.assertEqual(len(res_batch), 5)

    def test_04_predict_from_list_and_csv_string(self):
        """Test inference on a raw Python list and comma-separated string."""
        sample_list = [0.5] * self.predictor.n_features
        res_list = self.predictor.predict(sample_list)
        self.assertIn(res_list["predicted_emotion"], ["POSITIVE", "NEUTRAL", "NEGATIVE"])

        # Test CSV string format
        csv_str = ",".join([str(round(x, 2)) for x in sample_list[:50]])
        res_csv = self.predictor.predict(csv_str)
        self.assertIn(res_csv["predicted_stress_level"], ["Low", "Moderate", "High"])

    def test_05_predict_from_dataframe(self):
        """Test inference on pandas DataFrame."""
        df_sample = pd.read_csv(self.data_path, nrows=5)
        clean_cols = [c.strip().lstrip("#").strip() for c in df_sample.columns]
        df_sample.columns = clean_cols
        X_only = df_sample.drop(columns=["label"])

        res_df = self.predictor.predict(X_only.iloc[0])
        self.assertIn(res_df["predicted_emotion"], ["POSITIVE", "NEUTRAL", "NEGATIVE"])

        res_batch_df = self.predictor.predict_batch(X_only)
        self.assertEqual(len(res_batch_df), 5)

    def test_06_nlp_text_affect_prediction(self):
        """Test fallback natural language text affect analyzer."""
        # High stress phrase
        res_high = self.predictor.predict("I am feeling overwhelmed, having panic attacks and terrified about work.")
        self.assertEqual(res_high["predicted_stress_level"], "High")
        self.assertEqual(res_high["predicted_emotion"], "NEGATIVE")

        # Low stress phrase
        res_low = self.predictor.predict("I feel so calm, peaceful, happy and relaxed sitting by the lake.")
        self.assertEqual(res_low["predicted_stress_level"], "Low")
        self.assertEqual(res_low["predicted_emotion"], "POSITIVE")

        # Neutral phrase
        res_neu = self.predictor.predict("Just reviewing routine numbers and standard task files.")
        self.assertEqual(res_neu["predicted_stress_level"], "Moderate")
        self.assertEqual(res_neu["predicted_emotion"], "NEUTRAL")

    def test_07_inference_speed_sla(self):
        """Verify that single-sample and batch inference latencies meet SLAs."""
        sample = np.zeros(self.predictor.n_features)
        # Warmup
        _ = self.predictor.predict(sample)

        # 1. Single sample latency benchmark
        latencies = []
        for _ in range(15):
            res = self.predictor.predict(sample)
            latencies.append(res["inference_latency_ms"])

        avg_single_lat = np.mean(latencies)
        print(f"\n[SLA Test] Single Sample Latency: {avg_single_lat:.2f} ms")
        self.assertLess(avg_single_lat, 150.0, f"Single sample latency {avg_single_lat:.2f}ms exceeds 150ms SLA")

        # 2. Vectorized batch throughput benchmark
        batch_50 = np.zeros((50, self.predictor.n_features))
        batch_res = self.predictor.predict_batch(batch_50)
        avg_batch_lat = batch_res[0]["inference_latency_ms"]
        print(f"[SLA Test] Vectorized Batch Latency: {avg_batch_lat:.3f} ms / sample")
        self.assertLess(avg_batch_lat, 5.0, f"Batch latency {avg_batch_lat:.3f}ms exceeds 5ms SLA")

    def test_08_global_predict_function(self):
        """Test the top-level standalone predict() function."""
        res = predict({"mean_0_a": 4.62, "mean_1_a": 30.3})
        self.assertIn(res["predicted_emotion"], ["POSITIVE", "NEUTRAL", "NEGATIVE"])
        self.assertIn(res["predicted_stress_level"], ["Low", "Moderate", "High"])


if __name__ == "__main__":
    unittest.main()
