import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import profileService from '../../services/profileService';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  BookOpen,
  Brain,
  TrendingUp,
  Flame,
  ShieldCheck,
  Check,
  User,
  GraduationCap,
  Calendar,
  Layers,
  Clock,
  Award,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export function OnboardingFlow({ onComplete }) {
  const { user, profile, completeOnboarding } = useAuth();
  const [currentStep, setCurrentStep] = useState(0); // 0: Profile, 1: Assessment, 2: Feature Tour
  const [tourSlide, setTourSlide] = useState(0); // 0: Discovery, 1: Reading, 2: Mastery
  const [isSaving, setIsSaving] = useState(false);

  // Profile Form State
  const [fullName, setFullName] = useState(profile?.full_name || 'Alex Mercer');
  const [standing, setStanding] = useState(
    profile?.academic_standing || 'Civil Services Aspirant'
  );
  const [focusAreas, setFocusAreas] = useState(
    profile?.focus_areas || ['UPSC', 'LAW', 'ECONOMICS']
  );
  const [culmination, setCulmination] = useState(
    profile?.culmination_label || 'Target 2026'
  );
  const [nameError, setNameError] = useState('');

  // Assessment Form State
  const [goalPreference, setGoalPreference] = useState(0); // 0: Active Aspirant, 1: Future Planner, 2: Casual Scholar
  const [depthPreference, setDepthPreference] = useState(1); // 0: Briefing, 1: Deep Dive, 2: Expert
  const [rhythmPreference, setRhythmPreference] = useState(0); // 0: Daily 45m, 1: Weekend Deep Dive, 2: Self-Paced

  const standingOptions = [
    'Civil Services Aspirant',
    'Undergraduate Student',
    'Graduate/Postgraduate Student',
    'Doctoral Candidate / Ph.D. Scholar',
    'Independent Researcher',
    'Academic Faculty / Professor',
    'Professional / Lifelong Learner',
  ];

  const focusOptions = [
    'UPSC',
    'LAW',
    'ECONOMICS',
    'GRE',
    'STEM',
    'MEDICINE',
    'HISTORY',
    'LITERATURE',
  ];

  const culminationOptions = [
    'Target 2026',
    'Target 2027',
    'Target 2028',
    'Ongoing Research',
    'Lifelong Mastery',
  ];

  const toggleFocus = (tag) => {
    if (focusAreas.includes(tag)) {
      if (focusAreas.length > 1) {
        setFocusAreas(focusAreas.filter((t) => t !== tag));
      } else {
        toast.info('Please keep at least one core focus area selected.');
      }
    } else {
      setFocusAreas([...focusAreas, tag]);
    }
  };

  const handleProfileNext = (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setNameError('Please enter your full name.');
      return;
    }
    setNameError('');
    setCurrentStep(1);
  };

  const handleAssessmentNext = () => {
    setCurrentStep(2);
  };

  const handleFinishOnboarding = async () => {
    setIsSaving(true);
    const profilePayload = {
      full_name: fullName.trim(),
      academic_standing: standing,
      culmination_label: culmination,
      focus_areas: focusAreas,
    };

    const prefPayload = {
      daily_reading_goal_minutes: rhythmPreference === 0 ? 45 : rhythmPreference === 1 ? 60 : 30,
      auto_generate_quiz: true,
      email_digest: true,
    };

    try {
      await profileService.updateProfile(profilePayload);
      await profileService.updatePreferences(prefPayload);
    } catch (err) {
      console.warn('Backend sync failed, saving locally:', err);
    } finally {
      setIsSaving(false);
      completeOnboarding(profilePayload);
      toast.success('Welcome to Tootler Scholar Collective!', {
        description: 'Your personalized academic agenda is ready.',
      });
      if (onComplete) onComplete();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between selection:bg-primary/20 selection:text-primary">
      {/* Top Progress Header */}
      <div className="border-b border-border/40 bg-card/60 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-md">
              T
            </div>
            <span className="font-bold tracking-tight text-lg text-foreground">Tootler</span>
            <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              Scholar Onboarding
            </span>
          </div>

          {/* Step Progress Indicators */}
          <div className="flex items-center gap-2">
            {[0, 1, 2].map((step) => (
              <div
                key={step}
                className={`h-1.5 rounded-full transition-all ${
                  currentStep === step
                    ? 'w-8 bg-primary'
                    : currentStep > step
                    ? 'w-4 bg-primary/60'
                    : 'w-4 bg-muted'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {currentStep === 2 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFinishOnboarding}
                disabled={isSaving}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                Skip Tour
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-8 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {/* STEP 1: Complete Your Profile */}
          {currentStep === 0 && (
            <motion.div
              key="step-profile"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="w-full max-w-2xl bg-card border border-border/70 rounded-3xl p-6 sm:p-10 shadow-xl space-y-6"
            >
              <div className="text-center space-y-1.5">
                <Badge variant="outline" className="text-xs border-primary/30 text-primary mb-1">
                  Step 1 of 3
                </Badge>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                  Complete Your Profile
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                  Your identity within the academic collective. Sharp, professional, and precise.
                </p>
              </div>

              <form onSubmit={handleProfileNext} className="space-y-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-primary" /> Full Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Alex Mercer"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      setNameError('');
                    }}
                    className={`h-11 bg-background/60 text-sm font-medium ${
                      nameError ? 'border-destructive' : 'border-input'
                    }`}
                    required
                  />
                  {nameError && (
                    <p className="text-xs text-destructive font-medium">{nameError}</p>
                  )}
                </div>

                {/* Academic Standing */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-primary" /> Academic Standing
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {standingOptions.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setStanding(opt)}
                        className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between ${
                          standing === opt
                            ? 'bg-primary/10 border-primary text-primary shadow-sm'
                            : 'bg-background/40 border-border/70 text-muted-foreground hover:border-primary/40 hover:text-foreground'
                        }`}
                      >
                        <span>{opt}</span>
                        {standing === opt && <Check className="w-3.5 h-3.5 text-primary shrink-0 ml-1" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Core Academic Focus */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-primary" /> Core Academic Focus
                    </span>
                    <span className="text-[11px] font-normal text-muted-foreground">
                      Select all that apply
                    </span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {focusOptions.map((tag) => {
                      const isSelected = focusAreas.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleFocus(tag)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-primary text-primary-foreground shadow-sm'
                              : 'bg-muted/50 border border-border/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Target Milestone / Year */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary" /> Target Culmination
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {culminationOptions.map((culm) => (
                      <button
                        key={culm}
                        type="button"
                        onClick={() => setCulmination(culm)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          culmination === culm
                            ? 'bg-primary/15 border border-primary text-primary'
                            : 'bg-background/40 border border-border/70 text-muted-foreground hover:border-primary/40'
                        }`}
                      >
                        {culm}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-sm font-bold tracking-wide shadow-md gap-2"
                >
                  Continue to Diagnostic <ArrowRight className="w-4 h-4" />
                </Button>
              </form>
            </motion.div>
          )}

          {/* STEP 2: Diagnostic & Study Rhythm */}
          {currentStep === 1 && (
            <motion.div
              key="step-assessment"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="w-full max-w-2xl bg-card border border-border/70 rounded-3xl p-6 sm:p-10 shadow-xl space-y-6"
            >
              <div className="text-center space-y-1.5">
                <Badge variant="outline" className="text-xs border-primary/30 text-primary mb-1">
                  Step 2 of 3
                </Badge>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                  Diagnostic & Study Rhythm
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                  Customize the synthesis depth and retention cadence for your daily reading sessions.
                </p>
              </div>

              <div className="space-y-6">
                {/* Primary Objective */}
                <div className="space-y-2.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Primary Goal
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: 0, title: 'Active Aspirant', desc: 'Daily high-density synthesis for competitive exams.' },
                      { id: 1, title: 'Future Planner', desc: 'Systematic knowledge building for upcoming milestones.' },
                      { id: 2, title: 'Casual Scholar', desc: 'Deliberate intellectual enrichment and high-signal news.' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setGoalPreference(item.id)}
                        className={`p-4 rounded-2xl border text-left transition-all space-y-1 ${
                          goalPreference === item.id
                            ? 'bg-primary/10 border-primary text-foreground shadow-sm ring-1 ring-primary'
                            : 'bg-background/40 border-border/70 text-muted-foreground hover:border-primary/40'
                        }`}
                      >
                        <div className="text-xs font-bold text-foreground flex items-center justify-between">
                          <span>{item.title}</span>
                          {goalPreference === item.id && <Check className="w-3.5 h-3.5 text-primary" />}
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          {item.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ingestion Depth */}
                <div className="space-y-2.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Briefing Synthesis Depth
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: 0, title: 'Briefing (4m)', desc: 'Executive summaries, bullet key insights, and vocabulary.' },
                      { id: 1, title: 'Deep Dive (8m)', desc: 'Complete breakdown, AI annotations, and analytical context.' },
                      { id: 2, title: 'Mastery (15m)', desc: 'Comprehensive literature citations, active recall drills.' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setDepthPreference(item.id)}
                        className={`p-4 rounded-2xl border text-left transition-all space-y-1 ${
                          depthPreference === item.id
                            ? 'bg-primary/10 border-primary text-foreground shadow-sm ring-1 ring-primary'
                            : 'bg-background/40 border-border/70 text-muted-foreground hover:border-primary/40'
                        }`}
                      >
                        <div className="text-xs font-bold text-foreground flex items-center justify-between">
                          <span>{item.title}</span>
                          {depthPreference === item.id && <Check className="w-3.5 h-3.5 text-primary" />}
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          {item.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Study Rhythm */}
                <div className="space-y-2.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Study Rhythm & Quotas
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: 0, title: 'Daily 45 Min', desc: 'Daily spaced repetition with morning briefing notifications.' },
                      { id: 1, title: 'Weekend Focus', desc: 'Accumulated weekly briefs synthesized on Saturdays.' },
                      { id: 2, title: 'Self-Paced', desc: 'Flexible on-demand reading and instant custom quizzes.' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setRhythmPreference(item.id)}
                        className={`p-4 rounded-2xl border text-left transition-all space-y-1 ${
                          rhythmPreference === item.id
                            ? 'bg-primary/10 border-primary text-foreground shadow-sm ring-1 ring-primary'
                            : 'bg-background/40 border-border/70 text-muted-foreground hover:border-primary/40'
                        }`}
                      >
                        <div className="text-xs font-bold text-foreground flex items-center justify-between">
                          <span>{item.title}</span>
                          {rhythmPreference === item.id && <Check className="w-3.5 h-3.5 text-primary" />}
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          {item.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(0)}
                    className="h-12 px-5 text-xs font-semibold gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </Button>
                  <Button
                    type="button"
                    onClick={handleAssessmentNext}
                    className="flex-1 h-12 text-sm font-bold tracking-wide shadow-md gap-2"
                  >
                    View Platform Showcase <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Platform Feature Discovery Tour */}
          {currentStep === 2 && (
            <motion.div
              key="step-tour"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="w-full max-w-2xl bg-card border border-border/70 rounded-3xl p-6 sm:p-10 shadow-xl space-y-6"
            >
              <div className="text-center space-y-1.5">
                <Badge variant="outline" className="text-xs border-primary/30 text-primary mb-1">
                  Step 3 of 3 • Feature Tour
                </Badge>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                  {tourSlide === 0 && 'Curated Discovery'}
                  {tourSlide === 1 && 'Deep Reading with AI Teacher'}
                  {tourSlide === 2 && 'Master Your Knowledge'}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                  {tourSlide === 0 &&
                    'Daily insights from world-class sources like The Hindu, PIB, and PRS Legislative, tailored to your focus.'}
                  {tourSlide === 1 &&
                    'Interact with your documents using our AI Teacher. Highlight, annotate, and get instant explanations.'}
                  {tourSlide === 2 &&
                    'Strengthen retention with smart revision paths, retention curves, and daily streak rewards.'}
                </p>
              </div>

              {/* Interactive Showcase Graphic Area */}
              <div className="min-h-[260px] rounded-2xl bg-gradient-to-br from-primary/10 via-muted/30 to-background border border-border/70 p-6 flex items-center justify-center relative overflow-hidden shadow-inner">
                {tourSlide === 0 && (
                  <motion.div
                    key="slide-0"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-3 w-full max-w-md"
                  >
                    <div className="p-3.5 rounded-xl bg-card border border-primary/30 shadow-md flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-md bg-primary text-primary-foreground font-black text-xs flex items-center justify-center">
                          H
                        </div>
                        <div>
                          <div className="text-xs font-bold text-foreground">THE HINDU</div>
                          <div className="text-[11px] text-muted-foreground">Geopolitics & Fiscal Policy Brief</div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-[10px] font-bold">4 MIN READ</Badge>
                    </div>

                    <div className="p-3.5 rounded-xl bg-card border border-border/60 shadow-sm flex items-center justify-between opacity-90">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-md bg-amber-500 text-white font-black text-xs flex items-center justify-center">
                          P
                        </div>
                        <div>
                          <div className="text-xs font-bold text-foreground">PRESS INFORMATION BUREAU</div>
                          <div className="text-[11px] text-muted-foreground">Cabinet Committee Approvals & Policy</div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-[10px] font-bold">6 MIN READ</Badge>
                    </div>

                    <div className="p-3.5 rounded-xl bg-card border border-border/60 shadow-sm flex items-center justify-between opacity-75">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-md bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                          PRS
                        </div>
                        <div>
                          <div className="text-xs font-bold text-foreground">PRS LEGISLATIVE RESEARCH</div>
                          <div className="text-[11px] text-muted-foreground">Parliamentary Bills & Standing Reports</div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-[10px] font-bold">5 MIN READ</Badge>
                    </div>
                  </motion.div>
                )}

                {tourSlide === 1 && (
                  <motion.div
                    key="slide-1"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md space-y-3"
                  >
                    <div className="p-4 rounded-xl bg-card border border-border/70 shadow-sm space-y-2">
                      <div className="text-xs font-bold text-primary flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> AI TEACHER EXPLANATION
                      </div>
                      <p className="text-xs text-foreground/90 italic bg-primary/10 p-2.5 rounded-lg border border-primary/20">
                        "The Doctrine of Proportionality requires that state interference with fundamental rights must pursue a legitimate aim and be strictly necessary."
                      </p>
                      <div className="flex gap-2 pt-1">
                        <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">Explain Concept</Badge>
                        <Badge variant="outline" className="text-[10px] border-border text-muted-foreground">Generate Quiz Question</Badge>
                      </div>
                    </div>
                  </motion.div>
                )}

                {tourSlide === 2 && (
                  <motion.div
                    key="slide-2"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md grid grid-cols-2 gap-3"
                  >
                    <div className="p-4 rounded-xl bg-card border border-border/70 shadow-sm text-center space-y-1">
                      <TrendingUp className="w-5 h-5 text-primary mx-auto" />
                      <div className="text-2xl font-black text-foreground">94%</div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Retention Rate</div>
                    </div>

                    <div className="p-4 rounded-xl bg-card border border-primary/30 shadow-sm text-center space-y-1 bg-primary/5">
                      <Flame className="w-5 h-5 text-amber-500 mx-auto" />
                      <div className="text-2xl font-black text-amber-500">12 DAYS</div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Current Streak</div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Dots Indicator */}
              <div className="flex items-center justify-center gap-2">
                {[0, 1, 2].map((slide) => (
                  <button
                    key={slide}
                    type="button"
                    onClick={() => setTourSlide(slide)}
                    className={`h-2 rounded-full transition-all ${
                      tourSlide === slide ? 'w-6 bg-primary' : 'w-2 bg-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>

              {/* Tour Controls */}
              <div className="flex items-center gap-3 pt-2">
                {tourSlide > 0 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setTourSlide(tourSlide - 1)}
                    className="h-12 px-5 text-xs font-semibold gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Previous
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    className="h-12 px-5 text-xs font-semibold gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </Button>
                )}

                {tourSlide < 2 ? (
                  <Button
                    type="button"
                    onClick={() => setTourSlide(tourSlide + 1)}
                    className="flex-1 h-12 text-sm font-bold tracking-wide shadow-md gap-2"
                  >
                    Next Feature <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleFinishOnboarding}
                    disabled={isSaving}
                    className="flex-1 h-12 text-sm font-bold tracking-wide shadow-md gap-2 bg-primary hover:bg-primary/90"
                  >
                    <Sparkles className="w-4 h-4" />
                    Enter Scholar Dashboard
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-muted-foreground border-t border-border/40">
        Tootler Academic Collective • Powered by AI Teacher & Spaced Repetition
      </footer>
    </div>
  );
}

export default OnboardingFlow;
