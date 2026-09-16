import React from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Check, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function PricingSection({ onGetStarted }) {
  const { isAuthenticated } = useAuth();

  const plans = [
    {
      name: 'Free Learner',
      price: '$0',
      period: 'forever',
      description: 'Essential retention tools for active readers and students.',
      features: [
        'Up to 10 curated feeds & X sources',
        'Distraction-free deep article reader',
        'Daily 3-question active recall quizzes',
        'Personal library & bookmarking',
        '7-day streak & activity heatmap',
      ],
      cta: 'Get Started Free',
      popular: false,
    },
    {
      name: 'Pro Scholar',
      price: '$12',
      period: 'per month',
      description: 'Full cognitive suite for civil service aspirants and professionals.',
      features: [
        'Unlimited verified sources & Twitter accounts',
        'Structured key takeaway synthesis',
        'Full SuperMemo SM-2 spaced repetition engine',
        'Unlimited flashcard decks & retention cards',
        'Cohort leaderboards & weekly analytics',
        'Audio narration for long-form briefs',
        'Priority API sync frequency (every 15m)',
      ],
      cta: 'Upgrade to Pro Scholar',
      popular: true,
    },
  ];

  return (
    <section id="pricing" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <Badge variant="outline" className="mb-3 text-xs font-semibold text-primary border-primary/30">
          <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Transparent Membership
        </Badge>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Invest in High-Leverage Memory Retention
        </h2>
        <p className="mt-4 text-base sm:text-lg text-muted-foreground">
          Start completely free with zero friction. Upgrade only when you want the full automated spaced repetition engine.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
        {plans.map((plan, idx) => (
          <Card
            key={idx}
            className={`p-8 rounded-3xl flex flex-col justify-between transition-all duration-300 relative ${
              plan.popular
                ? 'bg-card border-primary/50 shadow-2xl ring-2 ring-primary/30'
                : 'bg-card/50 border-border/70 hover:border-border'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground font-bold px-3 py-1 shadow-md text-xs">
                  Most Popular
                </Badge>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-6 min-h-[36px]">
                {plan.description}
              </p>

              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-black text-foreground tracking-tight">
                  {plan.price}
                </span>
                <span className="text-xs font-medium text-muted-foreground">
                  /{plan.period}
                </span>
              </div>

              <div className="space-y-3 pb-8 border-b border-border/50">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  What’s included:
                </span>
                {plan.features.map((feat, fidx) => (
                  <div key={fidx} className="flex items-start gap-3 text-xs sm:text-sm text-foreground">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8">
              <Button
                size="lg"
                variant={plan.popular ? 'default' : 'outline'}
                onClick={onGetStarted}
                className={`w-full h-12 text-sm font-bold shadow-md gap-2 ${
                  plan.popular ? 'shadow-primary/20' : ''
                }`}
              >
                {isAuthenticated ? 'Access Dashboard' : plan.cta}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

export default PricingSection;
