Disha

Career discovery that measures what you're good at without stress — then teaches you the rest.

Disha connects a VR career-exploration game with Tootler, an ed-tech platform that generates personalized articles and quizzes from a user's interests. Together they form a closed loop: play a career scenario, detect both performance and emotional state via EEG, study the exact gaps that were flagged, prove mastery with a quiz, and unlock the next scenario.

Why

Most career-aptitude tools measure one thing: how well you performed. They miss a second, arguably more important signal — how the person felt while performing. Someone can ace a legal-reasoning simulation while their nervous system is quietly screaming, and someone else can fumble a STEM puzzle while completely calm and engaged. The first is a fragile skill under pressure; the second is a latent strength worth developing.

Disha captures both signals simultaneously and treats "high performance + low stress" as the real marker of genuine career fit — not performance alone.

How It Works
   ┌─────────┐     ┌──────────────────┐     ┌─────────┐     ┌────────┐
   │  PLAY   │ --> │      DETECT       │ --> │  STUDY  │ --> │  TEST  │
   │ VR level│     │ performance + EEG │     │ Tootler │     │ Tootler│
   └─────────┘     └──────────────────┘     └─────────┘     └────────┘
        ^                                                         |
        |                    UNLOCK next level                    |
        └─────────────────────────────────────────────────────────┘
Play — The user wears EEG electrodes while playing career-scenario levels in the VR game (law, STEM, UPSC-style simulations, and others).
Detect — The system logs two parallel streams per task:
In-game performance: choices made, retries, completion time, accuracy.
EEG-based emotional state: calm/engaged vs. stressed, per task segment.
Profile — These streams are fused into a fit profile that separates what you're good at from what you're good at without strain.
Study — The flagged topic or field is handed off to Tootler, which pulls from the user's existing reading history (e.g. Twitter handles) to generate personalized articles and calibrated quizzes targeting the specific gaps the VR session surfaced.
Test & Unlock — Quiz mastery in Tootler unlocks the next VR level, closing the loop and pulling the user deeper into the field that fits them.
Core Components
Component	Responsibility
VR Career Engine	Renders career-scenario levels, captures gameplay/performance telemetry
EEG Signal Pipeline	Acquires and processes EEG data, classifies emotional state per task
Fusion Layer	Combines performance + emotional-state data into a per-user fit profile
Tootler	Generates personalized articles and quizzes from reading history and flagged gaps
Progression Service	Tracks quiz mastery and gates access to subsequent VR levels
Status

Early-stage concept / prototype. Architecture and interfaces below are provisional.

Roadmap (draft)
 Define EEG feature set and emotional-state classification thresholds
 Build VR level → performance telemetry schema
 Design fusion-layer scoring model (performance × emotional state)
 Tootler integration: gap → topic mapping
 Quiz mastery → VR unlock gating logic
 End-to-end pilot with a single career track (e.g. law)
Disclaimer

EEG-based emotional-state inference is probabilistic, not diagnostic. Disha is a career-exploration aid, not a psychological or medical assessment tool.

License

TBD
