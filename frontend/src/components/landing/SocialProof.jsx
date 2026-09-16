import React from 'react';
import { Card } from '../ui/card';
import { BookMarked, BrainCircuit, Clock, TrendingUp } from 'lucide-react';

export function SocialProof() {
  const stats = [
    {
      icon: BookMarked,
      value: '25,000+',
      label: 'High-Signal Insights Ingested',
      change: '+38% this month',
    },
    {
      icon: BrainCircuit,
      value: '94.8%',
      label: '30-Day Long-Term Recall Rate',
      change: 'Powered by SuperMemo SM-2',
    },
    {
      icon: Clock,
      value: '45 mins/day',
      label: 'Average Saved Reading Time',
      change: 'Distilled takeaways',
    },
    {
      icon: TrendingUp,
      value: '18 Days',
      label: 'Average Continuous Study Streak',
      change: 'Gamified retention cohorts',
    },
  ];

  return (
    <section className="py-14 border-y border-border/40 bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card
                key={idx}
                className="p-5 sm:p-6 bg-card/60 border-border/60 backdrop-blur-sm hover:border-primary/30 transition-all shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {stat.change}
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                  {stat.value}
                </div>
                <div className="text-xs font-medium text-muted-foreground mt-1">
                  {stat.label}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default SocialProof;
