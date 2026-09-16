import React from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Link2, BookOpenCheck, BrainCircuit, Target, CheckCircle2 } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      step: '01',
      icon: Link2,
      title: 'Connect High-Signal Sources',
      description:
        'Point Tootler to your favorite domain experts, policy analysts, legal sources, or research publications on X/Twitter and web feeds.',
      highlight: 'Automated deduplication & cleaner',
    },
    {
      step: '02',
      icon: BookOpenCheck,
      title: 'Read with Deep Cognitive Ergonomics',
      description:
        'Digest briefs in an ultra-clean, ad-free reader equipped with instant 3-bullet takeaways, inline vocabulary, and text annotations.',
      highlight: 'Zero algorithmic noise or distractions',
    },
    {
      step: '03',
      icon: BrainCircuit,
      title: 'Cement into Memory with Daily Quizzes',
      description:
        'Take quick 3-minute morning quizzes. Our SM-2 spaced repetition scheduler automatically surfaces due cards right before you would forget them.',
      highlight: '30-day retention exceeding 94%',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <Badge variant="outline" className="mb-3 text-xs font-semibold text-primary border-primary/30">
          <Target className="w-3.5 h-3.5 mr-1" /> The Three-Step Loop
        </Badge>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          How Tootler Guarantees Long-Term Retention
        </h2>
        <p className="mt-4 text-base sm:text-lg text-muted-foreground">
          Moving from superficial scrolling to permanent mental mastery in three automated steps.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <Card
              key={idx}
              className="p-7 bg-card/70 border-border/70 backdrop-blur-sm rounded-2xl relative flex flex-col justify-between hover:border-primary/40 transition-all shadow-md group"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-2xl font-black text-muted-foreground/30 font-mono">
                    {step.step}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-foreground mb-2.5 tracking-tight">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  {step.description}
                </p>
              </div>

              <div className="pt-4 border-t border-border/40">
                <span className="text-xs font-semibold text-primary flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {step.highlight}
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

export default HowItWorks;
