import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  Rss,
  BookOpen,
  Brain,
  Flame,
  CheckCircle2,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function FeatureMatrix({ onGetStarted }) {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      id: 'ingestion',
      title: 'Automated Feed Ingestion',
      subtitle: 'Transform noisy Twitter/X feeds into structured study briefs',
      icon: Rss,
      badge: 'High Signal',
      description:
        'Tootler runs scheduled background scrapers with SHA-256 canonical hash deduplication to capture only the highest-leverage insights from top thinkers and institutional accounts without algorithmic distractions.',
      bulletPoints: [
        'Twitter/X OAuth2 and fast-sync scraper engine',
        'Automatic deduplication of reposts and quote tweets',
        'Auto-categorization into Governance, Tech, Science & Economics',
      ],
      previewContent: {
        title: 'Source: @balajis • Sovereign AI & Compute Infrastructure',
        tag: 'Deduplicated & Cleaned',
        body: 'ASML EUV mirrors operate at atomic-level tolerances with 5,000+ specialized tier-1 suppliers across the democratic world. Ingested at 09:15 UTC.',
        stat: '100% Noise Filtered',
      },
    },
    {
      id: 'reader',
      title: 'Distraction-Free Deep Reader',
      subtitle: 'Optimized for high-retention reading and active annotation',
      icon: BookOpen,
      badge: 'Cognitive Ergonomics',
      description:
        'Read in clean typography tailored for long-form synthesis. Progressive highlights, key takeaway cards, and contextual definitions let you break down dense papers without context switching.',
      bulletPoints: [
        'Curated 3-bullet Key Takeaways for every brief',
        'Inline vocabulary terms and conceptual definitions',
        'Reading progress tracking synced across sessions',
      ],
      previewContent: {
        title: 'Constitutional Jurisprudence & Fundamental Rights',
        tag: 'Reading Speed: 240 wpm',
        body: 'Key Takeaway: The Doctrine of Basic Structure (Kesavananda Bharati) acts as an irrevocable check on parliamentary amending power.',
        stat: '3 Key Vocabulary Cards',
      },
    },
    {
      id: 'retention',
      title: 'Adaptive Spaced Retention Engine',
      subtitle: 'Never forget what you read with automated SM-2 algorithms',
      icon: Brain,
      badge: 'SM-2 Spaced Algorithm',
      description:
        'Reading alone results in 70% forgetting within 24 hours. Tootler auto-generates active recall quizzes and schedules flashcards at optimal intervals (1d, 3d, 7d, 14d) to cement memory.',
      bulletPoints: [
        'Auto-generated daily 3-question retention checks',
        'Spaced reviews scored via Again / Hard / Good / Easy',
        'Forgetting curve mitigation with automated intervals',
      ],
      previewContent: {
        title: 'Active Recall Check • Due Today',
        tag: 'Interval: 7 Days',
        body: 'Question: What four criteria constitute the Modern Proportionality Test in constitutional review?',
        stat: '94.8% Retention Score',
      },
    },
    {
      id: 'engagement',
      title: 'Streaks & Cohort Leaderboards',
      subtitle: 'Gamified consistency that keeps you accountable',
      icon: Flame,
      badge: 'Accountability',
      description:
        'Build unbreakable study habits with our daily streak tracker, monthly activity heatmap, and competitive cohort leaderboards.',
      bulletPoints: [
        'Daily focus time & minutes read tracker',
        '28-day visual activity heatmap',
        'Weekly cohort rankings with peers at your skill level',
      ],
      previewContent: {
        title: 'Diamond Scholars Cohort #4',
        tag: 'Weekly Rank #3',
        body: 'Current Streak: 12 Days • Total Minutes Read: 340 mins • 48 Cards Mastered',
        stat: 'Top 5% Cohort Score',
      },
    },
  ];

  return (
    <section id="features" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <Badge variant="outline" className="mb-3 text-xs font-semibold text-primary border-primary/30">
          <Layers className="w-3.5 h-3.5 mr-1" /> Core Platform Capabilities
        </Badge>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Built for Serious Scholars & Knowledge Workers
        </h2>
        <p className="mt-4 text-base sm:text-lg text-muted-foreground">
          Every capability in Tootler is architected around cognitive science principles: reduce noise, deepen reading synthesis, and lock concepts into long-term recall.
        </p>
      </div>

      {/* Interactive Tabs */}
      <div className="grid lg:grid-cols-12 gap-8 items-center">
        {/* Tab Selection Column */}
        <div className="lg:col-span-5 space-y-3">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            const isSelected = activeFeature === idx;
            return (
              <button
                key={feat.id}
                type="button"
                onClick={() => setActiveFeature(idx)}
                className={`w-full text-left p-5 rounded-2xl transition-all border flex items-start gap-4 ${
                  isSelected
                    ? 'bg-card border-primary/40 shadow-lg ring-1 ring-primary/20'
                    : 'bg-card/40 border-border/60 hover:bg-card/80 hover:border-border'
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-base text-foreground tracking-tight">
                      {feat.title}
                    </span>
                    <Badge variant="secondary" className="text-[10px] font-semibold">
                      {feat.badge}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {feat.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Feature Display Card */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {features.map((feat, idx) => {
              if (idx !== activeFeature) return null;
              return (
                <motion.div
                  key={feat.id}
                  initial={{ opacity: 0, scale: 0.98, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="p-7 sm:p-9 bg-card/90 border-border/80 shadow-xl rounded-2xl relative overflow-hidden">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
                      <div className="flex items-center gap-2.5">
                        <feat.icon className="w-6 h-6 text-primary" />
                        <h3 className="text-xl font-bold text-foreground tracking-tight">
                          {feat.title}
                        </h3>
                      </div>
                      <Badge className="font-mono text-xs">{feat.badge}</Badge>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                      {feat.description}
                    </p>

                    <div className="space-y-3 mb-8">
                      {feat.bulletPoints.map((bp, bidx) => (
                        <div key={bidx} className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-foreground">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>{bp}</span>
                        </div>
                      ))}
                    </div>

                    {/* Dynamic Simulated Preview Box */}
                    <div className="rounded-xl bg-muted/40 p-4 border border-border/60 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-foreground">{feat.previewContent.title}</span>
                        <span className="text-[10px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
                          {feat.previewContent.tag}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {feat.previewContent.body}
                      </p>
                      <div className="pt-2 flex items-center justify-between text-[11px] font-semibold text-primary">
                        <span>{feat.previewContent.stat}</span>
                        <button
                          type="button"
                          onClick={onGetStarted}
                          className="hover:underline flex items-center gap-1"
                        >
                          Explore in App <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

export default FeatureMatrix;
