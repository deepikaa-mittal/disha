import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { ArrowRight, Compass, BookOpen, BrainCircuit, CheckCircle2, Play, Flame, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function HeroSection({ onGetStarted, onExploreDemo }) {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('reader'); // 'ingestion' | 'reader' | 'quiz'

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/10 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-chart-1/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-6 shadow-sm"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Spaced Repetition + Automated Ingestion</span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.1]"
          >
            Turn Infinite Feeds into{' '}
            <span className="bg-gradient-to-r from-primary via-chart-1 to-primary bg-clip-text text-transparent">
              Retained Knowledge
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto"
          >
            Tootler monitors your highest-signal X/Twitter accounts and study materials, distills key insights in a distraction-free reader, and cements knowledge with automated spaced retention quizzes.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5"
          >
            <Button
              size="lg"
              onClick={onGetStarted}
              className="w-full sm:w-auto h-12 px-7 text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all gap-2"
            >
              {isAuthenticated ? 'Open Application' : 'Start Retaining Free'}
              <ArrowRight className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={onExploreDemo}
              className="w-full sm:w-auto h-12 px-6 text-sm font-semibold border-border/80 hover:bg-accent/50 gap-2"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Try Interactive Demo
            </Button>
          </motion.div>

          {/* Trust snippet */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground"
          >
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>1-click passwordless login</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>CSR FastAPI Architecture</span>
            </div>
          </motion.div>
        </div>

        {/* Hero Interactive App Mockup Preview */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="mt-14 max-w-5xl mx-auto"
        >
          <Card className="border-border/80 bg-card/80 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden ring-1 ring-border/50">
            {/* Mockup Header Bar */}
            <div className="bg-muted/40 border-b border-border/60 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive/60" />
                <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                <span className="text-xs font-mono text-muted-foreground ml-2 hidden sm:inline">
                  tootler.app/reader/constitutional-precedents
                </span>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="flex items-center bg-background/60 p-1 rounded-lg border border-border/50 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setActiveTab('ingestion')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    activeTab === 'ingestion' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  1. Live Feed
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('reader')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    activeTab === 'reader' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  2. Deep Reader
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('quiz')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    activeTab === 'quiz' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  3. Retention Quiz
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-2">
                <Badge variant="secondary" className="text-[10px] font-bold text-amber-500 bg-amber-500/10 border-amber-500/20">
                  <Flame className="w-3 h-3 mr-1" /> 12 Day Streak
                </Badge>
              </div>
            </div>

            {/* Mockup Content Area */}
            <div className="p-6 sm:p-8 min-h-[380px] flex flex-col justify-between">
              {activeTab === 'ingestion' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between pb-3 border-b border-border/40">
                    <div>
                      <h3 className="font-bold text-base text-foreground">Curated Ingestion Pipeline</h3>
                      <p className="text-xs text-muted-foreground">Scraped from verified domain accounts & deduplicated via canonical hashes</p>
                    </div>
                    <Badge variant="outline" className="text-xs font-semibold text-emerald-500 border-emerald-500/30">
                      <Zap className="w-3 h-3 mr-1" /> 4 New Syncs Today
                    </Badge>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl bg-muted/20 border border-border/50 hover:border-primary/40 transition-colors">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                        <span className="font-semibold text-primary">@balajis • Tech Geopolitics</span>
                        <span>4 MIN READ</span>
                      </div>
                      <h4 className="font-bold text-sm text-foreground mb-1">The Architecture of Sovereign Compute Infrastructure</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">Why national compute independence requires full lithography supply chain resilience...</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/20 border border-border/50 hover:border-primary/40 transition-colors">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                        <span className="font-semibold text-primary">@LiveLawIndia • Constitutional Law</span>
                        <span>5 MIN READ</span>
                      </div>
                      <h4 className="font-bold text-sm text-foreground mb-1">Basic Structure Doctrine & Judicial Review</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">Analyzing 50 years of Kesavananda Bharati precedents on fundamental rights...</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'reader' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between pb-2 border-b border-border/40">
                    <Badge variant="secondary" className="text-xs font-semibold">Governance & Constitutional Law</Badge>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Reading Progress</span>
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full w-[65%]" />
                      </div>
                      <span className="font-bold text-foreground">65%</span>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-3">
                      <h3 className="text-xl font-bold tracking-tight text-foreground">
                        Constitutional Jurisprudence & Fundamental Rights Evolution
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        The doctrine of the <mark className="bg-primary/20 text-foreground px-1 py-0.5 rounded font-medium">Basic Structure</mark> established in Kesavananda Bharati remains the anchor of constitutional supremacy. Over the past five decades, judicial interpretation has expanded Article 21 to encompass human dignity and informational privacy.
                      </p>
                      <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs text-primary font-medium flex items-center gap-2">
                        <BookOpen className="w-4 h-4 shrink-0" />
                        <span>Key Insight: Proportionality test mandates legitimate goal, rational nexus, necessity, and balancing.</span>
                      </div>
                    </div>
                    <div className="bg-muted/30 p-4 rounded-xl border border-border/60 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <BrainCircuit className="w-3.5 h-3.5 text-primary" /> Key Vocabulary
                      </h4>
                      <div className="text-xs space-y-2">
                        <div>
                          <span className="font-semibold text-foreground">Proportionality Test:</span>
                          <p className="text-muted-foreground">Four-prong judicial standard assessing rights infringements.</p>
                        </div>
                        <div>
                          <span className="font-semibold text-foreground">Basic Structure:</span>
                          <p className="text-muted-foreground">Foundational pillars untouchable by Article 368 amendments.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'quiz' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between pb-2 border-b border-border/40">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">Daily Retention Check • Question 1 of 3</span>
                    <Badge variant="outline" className="text-xs font-medium">Active Recall</Badge>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-base font-bold text-foreground">
                      Which landmark judgment established the Doctrine of the Basic Structure of the Indian Constitution?
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-2.5 pt-1">
                      <div className="p-3 rounded-xl border border-border/60 bg-muted/20 text-xs font-medium flex items-center justify-between opacity-70">
                        <span>A. Golaknath v. State of Punjab</span>
                      </div>
                      <div className="p-3 rounded-xl border-2 border-emerald-500 bg-emerald-500/10 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-between shadow-sm">
                        <span>B. Kesavananda Bharati v. State of Kerala</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div className="p-3 rounded-xl border border-border/60 bg-muted/20 text-xs font-medium flex items-center justify-between opacity-70">
                        <span>C. Minerva Mills v. Union of India</span>
                      </div>
                      <div className="p-3 rounded-xl border border-border/60 bg-muted/20 text-xs font-medium flex items-center justify-between opacity-70">
                        <span>D. Maneka Gandhi v. Union of India</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400">
                    <strong>Recall Verified:</strong> Kesavananda Bharati (1973) held that Parliament cannot alter the basic structure. Scheduled for 4-day retention interval.
                  </div>
                </div>
              )}

              {/* Bottom bar */}
              <div className="pt-4 mt-4 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <BrainCircuit className="w-4 h-4 text-primary" /> Spaced Repetition Engine: Next review in <strong>4 days</strong>
                </span>
                <Button size="sm" variant="ghost" onClick={onExploreDemo} className="text-xs text-primary font-semibold hover:underline">
                  Launch Interactive Sandbox &rarr;
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}

export default HeroSection;
