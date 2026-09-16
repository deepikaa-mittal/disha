import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Compass,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Volume2,
  Bookmark,
  Sliders
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export function InteractiveDemo() {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [retentionStep, setRetentionStep] = useState('quiz'); // 'quiz' | 'spaced_review'
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const question = {
    prompt: 'In Constitutional Law, what standard prevents arbitrary exercise of legislative power against fundamental rights?',
    correctId: 'b',
    explanation: 'The Proportionality Test mandates a legitimate state aim, rational nexus, necessity (least intrusive means), and balancing.',
    options: [
      { id: 'a', text: 'Administrative Discretion Doctrine' },
      { id: 'b', text: 'Four-Prong Proportionality Test (Puttaswamy)' },
      { id: 'c', text: 'Absolute Parliamentary Sovereignty' },
      { id: 'd', text: 'Strict Temporal Estoppel' },
    ],
  };

  const handleSelectOption = (id) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(id);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOption) return;
    setIsAnswerSubmitted(true);
    if (selectedOption === question.correctId) {
      toast.success('Correct! Active recall triggered successfully.');
    } else {
      toast.error('Incorrect. Reviewing explanation will reinforce synaptic pathways.');
    }
  };

  const handleResetQuiz = () => {
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setRetentionStep('quiz');
  };

  const handleSpacedRating = (rating) => {
    toast.success(`Retention card scheduled! Next review interval: ${rating === 'Easy' ? '7 days' : rating === 'Good' ? '4 days' : '1 day'}`);
    setRetentionStep('quiz');
    setIsAnswerSubmitted(false);
    setSelectedOption(null);
  };

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.info(!isBookmarked ? 'Article saved to your personal library' : 'Removed from library');
  };

  const toggleAudio = () => {
    setIsPlayingAudio(!isPlayingAudio);
    if (!isPlayingAudio) {
      toast.info('Audio narration started');
    } else {
      toast.info('Audio paused');
    }
  };

  return (
    <section id="demo" className="py-24 bg-muted/20 border-y border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <Badge variant="outline" className="mb-3 text-xs font-semibold text-primary border-primary/30">
            <Compass className="w-3.5 h-3.5 mr-1" /> Live Sandbox
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Test the Experience Live Right Here
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground">
            Try the deep distraction-free reader on the left, then solve the automated retention quiz on the right.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Reader Demo */}
          <div className="lg:col-span-7">
            <Card className="bg-card border-border/80 shadow-xl rounded-2xl overflow-hidden">
              {/* Reader Header */}
              <div className="bg-muted/40 border-b border-border/60 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs font-semibold">Legal Jurisprudence</Badge>
                  <span className="text-xs text-muted-foreground">• 4 MIN READ</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFontSize(fontSize === 16 ? 18 : 16)}
                    className="h-8 px-2 text-xs font-medium"
                    title="Toggle Font Size"
                  >
                    <Sliders className="w-3.5 h-3.5 mr-1" /> {fontSize}px
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleAudio}
                    className={`h-8 w-8 ${isPlayingAudio ? 'text-primary' : 'text-muted-foreground'}`}
                    title="Audio Narration"
                  >
                    <Volume2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleBookmark}
                    className={`h-8 w-8 ${isBookmarked ? 'text-primary fill-primary' : 'text-muted-foreground'}`}
                    title="Bookmark"
                  >
                    <Bookmark className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Reader Content */}
              <div className="p-6 sm:p-8 space-y-4">
                <h3 className="text-2xl font-black text-foreground tracking-tight leading-snug">
                  The Evolution of Constitutional Supremacy in Modern Governance
                </h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground pb-2 border-b border-border/40">
                  <span className="font-semibold text-primary">Source: @LiveLawIndia</span>
                  <span>•</span>
                  <span>Verified Legal Synthesis</span>
                </div>

                <div
                  className="space-y-3.5 text-muted-foreground leading-relaxed transition-all"
                  style={{ fontSize: `${fontSize}px` }}
                >
                  <p>
                    The Indian constitutional order pivots on the delicate balance between legislative authority and judicial review. Under Article 368, Parliament possesses constituent power, but this power is not unbounded.
                  </p>
                  <p className="bg-primary/5 p-3 rounded-xl border-l-4 border-primary text-foreground font-medium">
                    The <mark className="bg-primary/20 text-foreground px-1 py-0.5 rounded">Proportionality Standard</mark> established through the Puttaswamy privacy judgment requires any state infringement of fundamental rights to satisfy four sequential prongs: legitimate aim, rational nexus, necessity (least intrusive measure), and strict balancing.
                  </p>
                  <p>
                    Understanding this standard is vital for analyzing privacy restrictions, state surveillance frameworks, and preventive detention challenges.
                  </p>
                </div>

                {/* Key Takeaways Box */}
                <div className="mt-6 p-4 rounded-xl bg-muted/40 border border-border/60">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground uppercase tracking-wider mb-2">
                    <BookOpen className="w-4 h-4 text-primary" /> Key Takeaway
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Rights cannot be curtailed purely for state convenience; the state must prove it chose the least restrictive means among all available policy options.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Retention Quiz Demo */}
          <div className="lg:col-span-5">
            <Card className="bg-card border-border/80 shadow-xl rounded-2xl p-6 sm:p-7 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-border/50 mb-5">
                  <div className="flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5 text-primary" />
                    <span className="font-bold text-sm text-foreground">Interactive Retention Sandbox</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono">Live Demo</Badge>
                </div>

                {retentionStep === 'quiz' ? (
                  <div className="space-y-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Active Recall Challenge
                    </span>
                    <h4 className="font-bold text-base text-foreground leading-snug">
                      {question.prompt}
                    </h4>

                    <div className="space-y-2 pt-2">
                      {question.options.map((opt) => {
                        const isSelected = selectedOption === opt.id;
                        let optionStyle = 'bg-muted/20 border-border/60 hover:bg-muted/40 text-foreground';

                        if (isAnswerSubmitted) {
                          if (opt.id === question.correctId) {
                            optionStyle = 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-semibold';
                          } else if (isSelected && opt.id !== question.correctId) {
                            optionStyle = 'bg-destructive/10 border-destructive text-destructive font-semibold';
                          } else {
                            optionStyle = 'bg-muted/10 border-border/30 opacity-50';
                          }
                        } else if (isSelected) {
                          optionStyle = 'bg-primary/10 border-primary text-foreground font-semibold ring-1 ring-primary';
                        }

                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleSelectOption(opt.id)}
                            disabled={isAnswerSubmitted}
                            className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition-all flex items-center justify-between ${optionStyle}`}
                          >
                            <span>{opt.text}</span>
                            {isAnswerSubmitted && opt.id === question.correctId && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            )}
                            {isAnswerSubmitted && isSelected && opt.id !== question.correctId && (
                              <XCircle className="w-4 h-4 text-destructive shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {isAnswerSubmitted && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3.5 rounded-xl bg-muted/40 border border-border/60 text-xs space-y-2 mt-4"
                      >
                        <span className="font-bold text-foreground">Explanation & Memory Anchor:</span>
                        <p className="text-muted-foreground leading-relaxed">{question.explanation}</p>
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                      SuperMemo SM-2 Interval
                    </Badge>
                    <h4 className="font-bold text-base text-foreground">
                      Rate your recall confidence for this concept:
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      This determines how many days before Tootler tests you again.
                    </p>

                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => handleSpacedRating('Again')}
                        className="h-12 border-destructive/40 hover:bg-destructive/10 text-destructive text-xs font-bold"
                      >
                        Again (&lt;10m)
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleSpacedRating('Hard')}
                        className="h-12 border-amber-500/40 hover:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold"
                      >
                        Hard (1 Day)
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleSpacedRating('Good')}
                        className="h-12 border-primary/40 hover:bg-primary/10 text-primary text-xs font-bold"
                      >
                        Good (4 Days)
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleSpacedRating('Easy')}
                        className="h-12 border-emerald-500/40 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold"
                      >
                        Easy (7 Days)
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Trigger */}
              <div className="pt-6 border-t border-border/50 mt-6">
                {!isAnswerSubmitted ? (
                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={!selectedOption}
                    className="w-full h-11 text-sm font-bold shadow-md"
                  >
                    Verify Answer
                  </Button>
                ) : retentionStep === 'quiz' ? (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleResetQuiz}
                      className="flex-1 h-11 text-xs font-semibold gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Retry
                    </Button>
                    <Button
                      onClick={() => setRetentionStep('spaced_review')}
                      className="flex-1 h-11 text-xs font-bold shadow-md"
                    >
                      Schedule Card &rarr;
                    </Button>
                  </div>
                ) : null}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

export default InteractiveDemo;
