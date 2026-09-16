"""
Synthetic EEG-feature dataset generator for the VR career-exploration + biofeedback project.

Reality check baked into this generator (see conversation notes):
- Raw EEG doesn't hand you "happiness"/"stress" numbers directly. Real pipelines compute
  band power (alpha/beta/theta) per channel, then derive indices from it:
    - frontal alpha asymmetry (right vs left alpha power)  -> valence (happy <-> sad)
    - beta/alpha ratio, beta power                          -> arousal / stress
- This script simulates a hidden physiological state (valence, arousal) per "epoch"
  (a few seconds of gameplay), generates plausible noisy band-power features from it,
  derives the indices the same way a real pipeline would, and buckets the result into
  an emotion label (Russell's circumplex: happy / calm / sad / stressed-anxious).

Output: eeg_synthetic_dataset.csv with raw-ish features + derived indices + labels.
"""

import numpy as np
import pandas as pd

RNG_SEED = 42
N_SAMPLES = 4000


def features_from_state(valence: np.ndarray, arousal: np.ndarray, rng: np.random.Generator) -> pd.DataFrame:
    """Turns a given hidden state (valence, arousal arrays) into band-power features +
    derived indices + labels. Factored out so a live server can drive this with a smooth,
    slowly-drifting state instead of resampling valence/arousal independently every tick."""
    n_samples = len(valence)

    # --- Band power simulation ---
    # Baseline power levels (arbitrary units, roughly matching relative EEG power scales)
    base_alpha = 20.0
    base_beta = 12.0
    base_theta = 15.0

    # Arousal/stress pushes beta up and alpha down (classic activation pattern)
    beta_left = base_beta * (1 + 0.9 * arousal) + rng.normal(0, 1.5, n_samples)
    beta_right = base_beta * (1 + 0.9 * arousal) + rng.normal(0, 1.5, n_samples)

    alpha_base_level = base_alpha * (1 - 0.5 * arousal)

    # Frontal alpha asymmetry carries valence: positive valence -> relatively LOWER
    # left-frontal alpha (i.e. more left activation), negative valence -> the opposite.
    # (This mirrors the approach/withdrawal literature on frontal asymmetry.)
    asymmetry_shift = -valence * 4.0
    alpha_left = alpha_base_level - asymmetry_shift / 2 + rng.normal(0, 1.2, n_samples)
    alpha_right = alpha_base_level + asymmetry_shift / 2 + rng.normal(0, 1.2, n_samples)
    alpha_left = np.clip(alpha_left, 1, None)
    alpha_right = np.clip(alpha_right, 1, None)

    # Theta rises a bit with low arousal / drowsiness and with negative valence (rumination)
    theta = base_theta * (1 + 0.3 * (1 - arousal)) * (1 + 0.15 * (1 - valence)) \
        + rng.normal(0, 1.5, n_samples)
    theta = np.clip(theta, 1, None)

    beta_left = np.clip(beta_left, 1, None)
    beta_right = np.clip(beta_right, 1, None)

    # --- Derived indices (this is what a real EEG pipeline computes downstream) ---
    frontal_asymmetry = np.log(alpha_right) - np.log(alpha_left)  # >0 ~ positive valence
    beta_alpha_ratio = (beta_left + beta_right) / (alpha_left + alpha_right)  # stress/arousal proxy
    engagement_index = (beta_left + beta_right) / (alpha_left + alpha_right + theta)

    # Scale into friendly 0-100 "indices" for the demo UI
    happiness_index = np.clip(50 + 35 * frontal_asymmetry + 15 * (arousal - 0.5), 0, 100)
    sadness_index = np.clip(50 - 35 * frontal_asymmetry - 15 * (arousal - 0.5) - 10 * valence, 0, 100)
    anxiety_stress_index = np.clip(40 * beta_alpha_ratio - 20 + 30 * arousal * (1 - np.clip(valence, 0, 1)), 0, 100)

    # Small measurement noise on the indices, like a real dashboard would show
    # (kept modest -- most of the tick-to-tick movement should come from the underlying
    # state actually drifting, not from sensor noise)
    happiness_index = np.clip(happiness_index + rng.normal(0, 1.5, n_samples), 0, 100)
    sadness_index = np.clip(sadness_index + rng.normal(0, 1.5, n_samples), 0, 100)
    anxiety_stress_index = np.clip(anxiety_stress_index + rng.normal(0, 1.5, n_samples), 0, 100)

    # --- Labels ---
    # Russell's circumplex quadrants from the *hidden* ground truth (not the noisy indices)
    def quadrant(v, a):
        if v >= 0 and a >= 0.5:
            return "happy_excited"
        if v >= 0 and a < 0.5:
            return "calm_content"
        if v < 0 and a >= 0.5:
            return "stressed_anxious"
        return "sad_low_energy"

    emotion_label = [quadrant(v, a) for v, a in zip(valence, arousal)]
    stress_binary = (arousal >= 0.5) & (valence < 0.2)  # simple "is this person stressed?" flag

    df = pd.DataFrame({
        "alpha_left": alpha_left,
        "alpha_right": alpha_right,
        "beta_left": beta_left,
        "beta_right": beta_right,
        "theta": theta,
        "frontal_asymmetry": frontal_asymmetry,
        "beta_alpha_ratio": beta_alpha_ratio,
        "engagement_index": engagement_index,
        "happiness_index": happiness_index,
        "sadness_index": sadness_index,
        "anxiety_stress_index": anxiety_stress_index,
        "true_valence": valence,      # kept for debugging / analysis, not a feature
        "true_arousal": arousal,      # kept for debugging / analysis, not a feature
        "emotion_label": emotion_label,
        "stress_binary": stress_binary.astype(int),
    })
    return df


def simulate(n_samples: int, seed: int = RNG_SEED) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    valence = rng.uniform(-1, 1, n_samples)   # -1 = very negative, +1 = very positive
    arousal = rng.uniform(0, 1, n_samples)    # 0 = calm/low energy, 1 = highly aroused
    return features_from_state(valence, arousal, rng)


class LiveStateWalker:
    """Mean-reverting random walk (Ornstein-Uhlenbeck) over (valence, arousal) so a live
    stream looks like a real, continuously-drifting physiological signal instead of
    teleporting to a fresh random value every tick."""

    def __init__(self, seed: int | None = None, theta: float = 0.08,
                 sigma_valence: float = 0.09, sigma_arousal: float = 0.07):
        self.rng = np.random.default_rng(seed)
        self.theta = theta
        self.sigma_valence = sigma_valence
        self.sigma_arousal = sigma_arousal
        self.valence = 0.0
        self.arousal = 0.35

    def step(self) -> pd.Series:
        self.valence += self.theta * (0.0 - self.valence) + self.sigma_valence * self.rng.normal()
        self.arousal += self.theta * (0.35 - self.arousal) + self.sigma_arousal * self.rng.normal()
        self.valence = float(np.clip(self.valence, -1, 1))
        self.arousal = float(np.clip(self.arousal, 0, 1))

        df = features_from_state(np.array([self.valence]), np.array([self.arousal]), self.rng)
        return df.iloc[0]


if __name__ == "__main__":
    df = simulate(N_SAMPLES)
    out_path = "eeg_synthetic_dataset.csv"
    df.to_csv(out_path, index=False)
    print(f"Wrote {len(df)} rows to {out_path}")
    print(df["emotion_label"].value_counts())
    print(df.head())
