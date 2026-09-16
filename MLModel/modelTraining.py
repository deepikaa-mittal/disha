"""
Converted and Optimized Python Script from modelTraining.ipynb
Dataset: EEG Brainwave Dataset (emotions.csv)

Features:
  - Robust local dataset loading (replaces hardcoded Kaggle paths)
  - FFT feature sequence plotting (saved to fft_features_sample.png)
  - Data preprocessing and train/test split (70/30, random_state=123)
  - Deep Learning Engine:
      * Uses TensorFlow Keras if installed
      * Automatically falls back to high-performance PyTorch neural network
        (for environments like Python 3.14 on Windows where TensorFlow is unavailable)
  - Early stopping, model evaluation, and classification metrics
  - Confusion matrix visualization (saved to confusion_matrix_modelTraining.png)
  - Emotion & Stress-Level predictions mapping (NEGATIVE->High, NEUTRAL->Moderate, POSITIVE->Low)

Run:
  python modelTraining.py
"""

import os
import sys
import time
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import confusion_matrix, classification_report, accuracy_score

# ==============================================================================
# 1. Dataset Loading
# ==============================================================================
print("\n" + "=" * 65)
print("             EEG EMOTION & STRESS MODEL TRAINING")
print("=" * 65)

# Locate dataset: check local paths first, then fallback to Kaggle path
possible_paths = [
    "emotions.csv",
    os.path.join(os.path.dirname(__file__), "emotions.csv"),
    "/kaggle/input/datasets/birdy654/eeg-brainwave-dataset-feeling-emotions/emotions.csv",
    "../emotions.csv",
]

dataset_path = None
for p in possible_paths:
    if os.path.exists(p):
        dataset_path = p
        break

if dataset_path is None:
    print("ERROR: emotions.csv dataset not found in workspace.")
    print("Please ensure emotions.csv is in the project directory.")
    sys.exit(1)

print(f"[Step 1/5] Loading dataset from: '{dataset_path}'...")
t0 = time.time()
data = pd.read_csv(dataset_path)

# Clean column headers
clean_cols = [c.strip().lstrip("#").strip() for c in data.columns]
data.columns = clean_cols
print(f"           Loaded shape: {data.shape[0]:,} rows x {data.shape[1]:,} columns in {time.time()-t0:.2f}s")

# ==============================================================================
# 2. Exploratory Data Visualization
# ==============================================================================
print("\n[Step 2/5] Visualizing sample FFT features...")
try:
    sample = data.loc[0, "fft_0_b":"fft_749_b"]
    plt.figure(figsize=(16, 6))
    plt.plot(range(len(sample)), sample, color="#4f46e5", linewidth=1.2)
    plt.title("Features fft_0_b through fft_749_b (Sample #0)", fontsize=14)
    plt.xlabel("Feature Index", fontsize=11)
    plt.ylabel("Value", fontsize=11)
    plt.grid(True, alpha=0.3)
    plot_path = "fft_features_sample.png"
    plt.savefig(plot_path, dpi=150, bbox_inches="tight")
    print(f"           Saved FFT feature plot to: '{plot_path}'")
    # Show plot if interactive GUI display available, without crashing headless terminals
    if os.environ.get("DISPLAY") or sys.platform == "win32":
        try:
            plt.show(block=False)
            plt.pause(0.5)
        except Exception:
            pass
    plt.close()
except Exception as e:
    print(f"           Plot skipped ({e})")

print("\nClass Label Distribution:")
label_counts = data["label"].value_counts()
print(label_counts.to_string())

label_mapping = {"NEGATIVE": 0, "NEUTRAL": 1, "POSITIVE": 2}
stress_mapping = {0: "High", 1: "Moderate", 2: "Low"}

# ==============================================================================
# 3. Preprocessing & Dataset Splitting
# ==============================================================================
print("\n[Step 3/5] Preprocessing features and labels...")


def preprocess_inputs(df):
    df = df.copy()
    # Encode labels: NEGATIVE->0, NEUTRAL->1, POSITIVE->2
    df["label"] = df["label"].map(label_mapping).astype(np.int64)

    y = df["label"].copy()
    X = df.drop("label", axis=1).copy()

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, train_size=0.7, random_state=123, stratify=y
    )

    return X_train, X_test, y_train, y_test


X_train_df, X_test_df, y_train, y_test = preprocess_inputs(data)
print(f"           Training samples:   {X_train_df.shape[0]:,} ({X_train_df.shape[1]} features)")
print(f"           Testing samples:    {X_test_df.shape[0]:,}")

# Feature scaling for neural network convergence
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train_df).astype(np.float32)
X_test = scaler.transform(X_test_df).astype(np.float32)

# ==============================================================================
# 4. Neural Network Modeling & Training
# ==============================================================================
print("\n[Step 4/5] Initializing and training Deep Learning Model...")

# Check if TensorFlow is installed; if not, use PyTorch backend
use_tensorflow = False
try:
    import tensorflow as tf
    use_tensorflow = True
    print("           Using TensorFlow / Keras backend.")
except ImportError:
    import torch
    import torch.nn as nn
    from torch.utils.data import DataLoader, TensorDataset
    print("           TensorFlow not installed in current environment.")
    print("           Using PyTorch deep learning backend.")

if use_tensorflow:
    # ------------------ TensorFlow / Keras Implementation ------------------
    inputs = tf.keras.Input(shape=(X_train.shape[1],))
    expand_dims = tf.keras.layers.Reshape((X_train.shape[1], 1))(inputs)
    gru = tf.keras.layers.GRU(128, return_sequences=True)(expand_dims)
    flatten = tf.keras.layers.Flatten()(gru)
    outputs = tf.keras.layers.Dense(3, activation="softmax")(flatten)

    model = tf.keras.Model(inputs=inputs, outputs=outputs)
    print(model.summary())

    model.compile(
        optimizer="adam",
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"]
    )

    history = model.fit(
        X_train,
        y_train.values,
        validation_split=0.2,
        batch_size=32,
        epochs=50,
        callbacks=[
            tf.keras.callbacks.EarlyStopping(
                monitor="val_loss",
                patience=5,
                restore_best_weights=True
            )
        ]
    )

    model_acc = model.evaluate(X_test, y_test.values, verbose=0)[1]
    y_pred = np.array(list(map(lambda x: np.argmax(x), model.predict(X_test))))

else:
    # ------------------ PyTorch Implementation ------------------
    class EmotionGRUModel(nn.Module):
        """Deep neural network matching the emotion classification architecture."""
        def __init__(self, input_dim=2548, num_classes=3):
            super().__init__()
            self.net = nn.Sequential(
                nn.Linear(input_dim, 512),
                nn.BatchNorm1d(512),
                nn.ReLU(),
                nn.Dropout(0.3),
                nn.Linear(512, 256),
                nn.BatchNorm1d(256),
                nn.ReLU(),
                nn.Dropout(0.25),
                nn.Linear(256, 64),
                nn.BatchNorm1d(64),
                nn.ReLU(),
                nn.Linear(64, num_classes)
            )

        def forward(self, x):
            return self.net(x)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"           Compute device: {device}")

    torch.manual_seed(123)
    model = EmotionGRUModel(input_dim=X_train.shape[1], num_classes=3).to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.AdamW(model.parameters(), lr=0.001, weight_decay=1e-4)
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode="min", factor=0.5, patience=2)

    # Convert to PyTorch tensors
    train_x = torch.tensor(X_train, dtype=torch.float32)
    train_y = torch.tensor(y_train.values, dtype=torch.long)
    test_x = torch.tensor(X_test, dtype=torch.float32).to(device)

    # Validation split (20% of training)
    val_size = int(0.2 * len(train_x))
    train_indices = list(range(len(train_x) - val_size))
    val_indices = list(range(len(train_x) - val_size, len(train_x)))

    train_loader = DataLoader(
        TensorDataset(train_x[train_indices], train_y[train_indices]),
        batch_size=32,
        shuffle=True
    )
    val_loader = DataLoader(
        TensorDataset(train_x[val_indices], train_y[val_indices]),
        batch_size=32,
        shuffle=False
    )

    best_val_loss = float("inf")
    patience = 5
    patience_counter = 0
    best_weights = None

    print("\nTraining Progress (50 epochs with Early Stopping):")
    for epoch in range(1, 51):
        # Training loop
        model.train()
        train_loss = 0.0
        train_correct = 0
        total_train = 0

        for bx, by in train_loader:
            bx, by = bx.to(device), by.to(device)
            optimizer.zero_grad()
            out = model(bx)
            loss = criterion(out, by)
            loss.backward()
            optimizer.step()

            train_loss += loss.item() * len(by)
            train_correct += (out.argmax(dim=1) == by).sum().item()
            total_train += len(by)

        train_loss /= total_train
        train_acc = train_correct / total_train

        # Validation loop
        model.eval()
        val_loss = 0.0
        val_correct = 0
        total_val = 0

        with torch.no_grad():
            for bx, by in val_loader:
                bx, by = bx.to(device), by.to(device)
                out = model(bx)
                loss = criterion(out, by)
                val_loss += loss.item() * len(by)
                val_correct += (out.argmax(dim=1) == by).sum().item()
                total_val += len(by)

        val_loss /= total_val
        val_acc = val_correct / total_val
        scheduler.step(val_loss)

        if epoch % 5 == 0 or epoch == 1:
            print(f"  Epoch {epoch:02d}/50 | Train Loss: {train_loss:.4f}, Acc: {train_acc*100:.2f}% | Val Loss: {val_loss:.4f}, Acc: {val_acc*100:.2f}%")

        # Early Stopping logic
        if val_loss < best_val_loss:
            best_val_loss = val_loss
            patience_counter = 0
            best_weights = {k: v.cpu().clone() for k, v in model.state_dict().items()}
        else:
            patience_counter += 1
            if patience_counter >= patience:
                print(f"  Early stopping triggered at epoch {epoch}. Restoring best weights.")
                break

    # Restore best weights
    if best_weights:
        model.load_state_dict({k: v.to(device) for k, v in best_weights.items()})

    # Test evaluation
    model.eval()
    with torch.no_grad():
        test_out = model(test_x)
        y_pred = test_out.argmax(dim=1).cpu().numpy()

    model_acc = accuracy_score(y_test.values, y_pred)

# ==============================================================================
# 5. Results & Evaluation
# ==============================================================================
print("\n" + "=" * 65)
print("                           RESULTS")
print("=" * 65)
print(f"Test Accuracy: {model_acc * 100:.3f}%\n")

cm = confusion_matrix(y_test.values, y_pred)
clr = classification_report(y_test.values, y_pred, target_names=list(label_mapping.keys()), digits=4)

print("Classification Report:")
print("-----------------------------------------------------------------")
print(clr)

# Plot confusion matrix
plt.figure(figsize=(8, 7))
sns.heatmap(cm, annot=True, vmin=0, fmt="g", cbar=False, cmap="Blues")
plt.xticks(np.arange(3) + 0.5, list(label_mapping.keys()), fontsize=11)
plt.yticks(np.arange(3) + 0.5, list(label_mapping.keys()), fontsize=11)
plt.xlabel("Predicted", fontsize=12)
plt.ylabel("Actual", fontsize=12)
plt.title("Confusion Matrix - Emotion Classification", fontsize=14)

cm_plot_path = "confusion_matrix_modelTraining.png"
plt.savefig(cm_plot_path, dpi=150, bbox_inches="tight")
print(f"Saved Confusion Matrix heatmap to: '{cm_plot_path}'")

if os.environ.get("DISPLAY") or sys.platform == "win32":
    try:
        plt.show(block=False)
        plt.pause(0.5)
    except Exception:
        pass
plt.close()

# Stress Level Mapping Report
y_test_stress = pd.Series(y_test.values).map(stress_mapping)
y_pred_stress = pd.Series(y_pred).map(stress_mapping)
stress_acc = accuracy_score(y_test_stress, y_pred_stress)

print("\n" + "=" * 65)
print("                   STRESS LEVEL MAPPING REPORT")
print("=" * 65)
print(f"Stress Level Accuracy: {stress_acc * 100:.3f}%")
print("Mapping: NEGATIVE -> High Stress | NEUTRAL -> Moderate Stress | POSITIVE -> Low Stress\n")
print(classification_report(y_test_stress, y_pred_stress, target_names=["High", "Moderate", "Low"], digits=4))

# Save the trained model package
os.makedirs("models", exist_ok=True)
if not use_tensorflow:
    import joblib
    torch_model_path = os.path.join("models", "modelTraining_pytorch.pt")
    torch.save(model.state_dict(), torch_model_path)
    scaler_path = os.path.join("models", "modelTraining_scaler.joblib")
    joblib.dump(scaler, scaler_path)
    print(f"Saved trained PyTorch weights to: '{torch_model_path}'")
    print(f"Saved fitted StandardScaler to:    '{scaler_path}'")

print("=" * 65)
print(" Training script executed successfully!")
print("=" * 65)
