# Disha — VR Career Discovery + EEG-Aware Adaptive Learning

An integrated system combining a VR career-exploration game with **Tootler**, an ed-tech content and quiz engine, connected through real-time EEG signal capture — so career guidance is based on objective performance and emotional response, not self-reported quizzes.

## Table of Contents

1. [Why this exists](#-why-this-exists)
2. [Features](#-features)
3. [System architecture](#-system-architecture)
4. [VR session modes](#-vr-session-modes)
5. [Pipelines](#-pipelines)
6. [Folder structure](#-folder-structure)
7. [Tech stack](#-tech-stack)
8. [Setup](#-setup)
9. [Current status & limitations](#-current-status--limitations)
10. [Datasets](#-datasets)
11. [License](#-license)

---

## 🎯 Why this exists

Most career guidance today relies on static personality quizzes and self-reported interest surveys. Students preparing for competitive exams (UPSC) or choosing between law, STEM, and other fields end up picking paths based on guesswork, peer pressure, or incomplete self-awareness — not genuine aptitude or psychological fit.

Separately, ed-tech platforms deliver generic, one-size-fits-all content that has no real connection to a learner's actual strengths, stress patterns, or knowledge gaps.

This project closes that gap: a VR game captures how a person actually **performs and feels** when facing real career-relevant tasks, and feeds that signal directly into a personalized learning loop.

## ✨ Features

- VR-based career simulation levels (law, STEM, UPSC-style scenarios)
- Real-time EEG capture during gameplay (arousal/stress vs. calm/engagement)
- Combined affect + aptitude profile generation per user
- Auto-generated, personalized articles and quizzes via Tootler based on that profile
- Quiz mastery unlocks the next VR level — a closed feedback loop
- Aggregated, evolving career-fit score per user across sessions

## 🏗 System architecture

```
┌─────────────────┐      ┌──────────────────┐
│   VR Game        │      │  EEG Headset      │
│ (Unity + OpenXR) │      │ (Muse / Emotiv)   │
└────────┬─────────┘      └────────┬──────────┘
         │  performance events     │  band-power stream
         └───────────┬─────────────┘
                      ▼
          ┌────────────────────────┐
          │  Profile Engine         │
          │ (fuses performance +    │
          │  affect into one score) │
          └───────────┬─────────────┘
                      ▼
          ┌────────────────────────┐
          │  Tootler Content Engine │
          │ (articles + quizzes)    │
          └───────────┬─────────────┘
                      ▼
             Quiz passed → unlocks
             next VR level
```

## 🎮 VR session modes

- **Solo exploration mode** — player works through career-scenario levels at their own pace, EEG optional
- **EEG-enabled mode** — full session with electrodes connected; performance + affect both logged
- **Assessment mode** — used by institutions for structured, proctored career-discovery sessions (e.g. school counseling periods)

## 🔄 Pipelines

1. **Capture pipeline** — VR event stream + EEG band-power stream synced via LSL/WebSocket, timestamp-aligned
2. **Scoring pipeline** — raw signals processed (BrainFlow/MNE) → arousal/valence classification → merged with performance metrics → profile score written to DB
3. **Content pipeline** — profile gaps passed to Tootler → fetches relevant handles/sources → LLM generates articles + calibrated quiz
4. **Unlock pipeline** — quiz result checked against mastery threshold → unlock flag written back → VR game reads flag on next launch

## 📁 Folder structure

```
careerloop/
├── vr-game/              # Unity project, VR levels, scenario scripts
├── eeg-service/          # Python service for EEG signal capture & processing
├── profile-engine/       # Scoring/fusion logic (Python, scikit-learn)
├── tootler-app/          # React Native/Flutter frontend
├── backend/              # Shared API layer (FastAPI/Node)
├── infra/                # Deployment configs, Docker, cloud setup
└── docs/                 # Architecture notes, data schemas
```

## 🛠 Tech stack

- **VR:** Unity, Meta Quest SDK / OpenXR
- **EEG:** Muse / Emotiv headset, BrainFlow or MNE (Python), LSL for sync
- **Backend:** FastAPI / Node.js, PostgreSQL, TimescaleDB (EEG time-series), Redis/Kafka
- **Profile engine:** Python, scikit-learn
- **Tootler:** React Native/Flutter, X (Twitter) API, Claude/GPT API for content generation
- **Infra:** AWS/GCP, S3, Auth0/Firebase

## ⚙️ Setup

```bash
# clone the repo
git clone https://github.com/<your-org>/careerloop.git
cd careerloop

# backend
cd backend && pip install -r requirements.txt --break-system-packages
uvicorn main:app --reload

# eeg service
cd ../eeg-service && pip install -r requirements.txt --break-system-packages
python stream_processor.py

# tootler app
cd ../tootler-app && npm install
npm run start
```

> Note: VR build requires Unity Hub + the target headset's SDK installed separately. See `docs/vr-setup.md`.

## 🚧 Current status & limitations

- EEG classification is currently limited to broad arousal/valence states, not fine-grained emotion labels — consumer-grade hardware doesn't reliably support finer classification
- Clock sync between EEG stream and VR engine is the most fragile part of the pipeline; timestamp drift is a known issue under investigation
- Profile scoring model is an early heuristic, not yet validated against real outcome data
- No production-grade consent/data-retention flow yet — required before any institutional pilot

## 📊 Datasets

- No proprietary training dataset yet; EEG affect classification currently uses open datasets (e.g. DEAP, SEED) for baseline model calibration before fine-tuning on in-house session data
- Tootler content sourcing relies on live X (Twitter) API pulls, not a static dataset

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.
