import React, { useState, useEffect } from 'react';
import learningService from '../../services/learningService';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  BrainCircuit,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Flame,
  Layers,
  ArrowRight,
  Trophy,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

export function QuizView() {
  const [activeTab, setActiveTab] = useState('daily_quiz'); // 'daily_quiz' | 'spaced_cards'
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);

  // Spaced retention cards state
  const [cards, setCards] = useState([]);
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [cardsReviewedCount, setCardsReviewedCount] = useState(0);

  useEffect(() => {
    const loadQuizData = async () => {
      const q = await learningService.getTodayQuiz();
      const c = await learningService.getDueRetentionCards();
      setQuiz(q);
      setCards(c || []);
    };
    loadQuizData();
  }, []);

  const handleSelectOption = (optId) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(optId);
  };

  const handleSubmitAnswer = async () => {
    if (!selectedOption || !quiz) return;
    const currentQ = quiz.questions[currentQuestionIdx];
    const isCorrect = currentQ.options.find((o) => o.id === selectedOption)?.isCorrect || false;

    setIsAnswerSubmitted(true);
    if (isCorrect) {
      setScore((prev) => prev + 1);
      toast.success('Correct! Synaptic recall validated.');
    } else {
      toast.error('Incorrect. Explanation will anchor the concept.');
    }

    await learningService.submitAttempt(currentQ.id, selectedOption, isCorrect);
  };

  const handleNextQuestion = () => {
    if (!quiz) return;
    if (currentQuestionIdx + 1 < quiz.questions.length) {
      setCurrentQuestionIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      setIsQuizCompleted(true);
      toast.success('Daily Quiz Complete! +50 Retention XP');
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setIsQuizCompleted(false);
  };

  const handleRateCard = async (rating) => {
    const card = cards[currentCardIdx];
    if (card) {
      await learningService.submitReview(card.id, rating.toLowerCase());
      toast.success(`Card scheduled with SM-2 interval (${rating})`);
      setCardsReviewedCount((prev) => prev + 1);
      setIsCardFlipped(false);
      if (currentCardIdx + 1 < cards.length) {
        setCurrentCardIdx((prev) => prev + 1);
      } else {
        toast.success('All due retention cards reviewed for today!');
      }
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/50">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            Retention & Spaced Learning Hub
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Mitigate the forgetting curve with scientifically scheduled active recall and SM-2 flashcard reviews.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold py-1">
            <BrainCircuit className="w-3.5 h-3.5 mr-1" /> SM-2 Engine Active
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 pb-2 border-b border-border/40">
        <button
          type="button"
          onClick={() => setActiveTab('daily_quiz')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'daily_quiz' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <BrainCircuit className="w-3.5 h-3.5" /> Daily Retention Quiz
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('spaced_cards')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'spaced_cards' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Layers className="w-3.5 h-3.5" /> Due Retention Cards ({cards.length})
        </button>
      </div>

      {/* Tab 1: Daily Quiz */}
      {activeTab === 'daily_quiz' && (
        <div>
          {quiz && !isQuizCompleted ? (
            <Card className="p-6 sm:p-8 bg-card border-border/80 shadow-lg rounded-3xl space-y-6">
              {/* Question Progress Header */}
              <div className="flex items-center justify-between pb-3 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs font-bold">
                    Question {currentQuestionIdx + 1} of {quiz.questions.length}
                  </Badge>
                  <span className="text-xs text-muted-foreground">• Active Recall</span>
                </div>
                <span className="text-xs font-mono text-muted-foreground">Score: {score}</span>
              </div>

              {/* Question Text */}
              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-bold text-foreground leading-snug">
                  {quiz.questions[currentQuestionIdx].prompt}
                </h3>
              </div>

              {/* Options */}
              <div className="space-y-2.5 pt-2">
                {quiz.questions[currentQuestionIdx].options.map((opt) => {
                  const isSelected = selectedOption === opt.id;
                  let style = 'bg-muted/20 border-border/60 hover:bg-muted/40 text-foreground';

                  if (isAnswerSubmitted) {
                    if (opt.isCorrect) {
                      style = 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold';
                    } else if (isSelected && !opt.isCorrect) {
                      style = 'bg-destructive/10 border-destructive text-destructive font-bold';
                    } else {
                      style = 'bg-muted/10 border-border/30 opacity-50';
                    }
                  } else if (isSelected) {
                    style = 'bg-primary/10 border-primary text-foreground font-semibold ring-1 ring-primary';
                  }

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectOption(opt.id)}
                      disabled={isAnswerSubmitted}
                      className={`w-full text-left p-4 rounded-2xl border text-xs sm:text-sm transition-all flex items-center justify-between ${style}`}
                    >
                      <span>{opt.text}</span>
                      {isAnswerSubmitted && opt.isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      )}
                      {isAnswerSubmitted && isSelected && !opt.isCorrect && (
                        <XCircle className="w-4 h-4 text-destructive shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation Box */}
              {isAnswerSubmitted && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl bg-muted/40 border border-border/60 text-xs space-y-1.5"
                >
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Memory Anchor & Explanation:
                  </span>
                  <p className="text-muted-foreground leading-relaxed">
                    {quiz.questions[currentQuestionIdx].explanation}
                  </p>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-border/40 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {isAnswerSubmitted ? 'Review explanation before proceeding' : 'Select an option to submit'}
                </span>
                {!isAnswerSubmitted ? (
                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={!selectedOption}
                    className="h-10 px-6 text-xs font-bold shadow-md"
                  >
                    Submit Answer
                  </Button>
                ) : (
                  <Button
                    onClick={handleNextQuestion}
                    className="h-10 px-6 text-xs font-bold shadow-md gap-1.5"
                  >
                    {currentQuestionIdx + 1 < quiz.questions.length ? 'Next Question' : 'View Results'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </Card>
          ) : isQuizCompleted ? (
            <Card className="p-8 text-center bg-card border-border/80 shadow-lg rounded-3xl space-y-4 max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-md">
                <Trophy className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-foreground">Daily Quiz Completed!</h2>
              <p className="text-xs text-muted-foreground">
                You scored <strong className="text-foreground">{score}</strong> out of{' '}
                <strong className="text-foreground">{quiz?.questions?.length || 3}</strong> on today’s active recall round.
              </p>

              <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 text-xs space-y-1">
                <span className="font-semibold text-emerald-500 flex items-center justify-center gap-1">
                  <Flame className="w-4 h-4 fill-current" /> Daily Retention Streak Maintained!
                </span>
                <p className="text-muted-foreground">These concepts have been logged into your spaced interval queue.</p>
              </div>

              <div className="pt-2 flex gap-3 justify-center">
                <Button variant="outline" onClick={handleRestartQuiz} className="text-xs font-semibold">
                  <RotateCcw className="w-3.5 h-3.5 mr-1" /> Retake Quiz
                </Button>
                <Button onClick={() => setActiveTab('spaced_cards')} className="text-xs font-bold">
                  Review Spaced Cards &rarr;
                </Button>
              </div>
            </Card>
          ) : null}
        </div>
      )}

      {/* Tab 2: Spaced Retention Cards */}
      {activeTab === 'spaced_cards' && (
        <div className="max-w-xl mx-auto space-y-6">
          {cards.length > 0 && currentCardIdx < cards.length ? (
            <Card className="p-8 bg-card border-border/80 shadow-xl rounded-3xl space-y-6 min-h-[380px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-border/40 mb-4">
                  <Badge variant="secondary" className="text-xs font-semibold">
                    {cards[currentCardIdx].topicName || 'General Topic'}
                  </Badge>
                  <span className="text-xs font-mono text-muted-foreground">
                    Card {currentCardIdx + 1} of {cards.length}
                  </span>
                </div>

                {/* Card Front/Back Flip */}
                <div className="space-y-4 pt-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Prompt / Question:
                  </span>
                  <h3 className="text-lg font-bold text-foreground leading-relaxed">
                    {cards[currentCardIdx].question}
                  </h3>

                  {isCardFlipped && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-1.5 mt-4"
                    >
                      <span className="text-xs font-bold uppercase tracking-wider text-primary">
                        Answer & Key Concept:
                      </span>
                      <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                        {cards[currentCardIdx].answer}
                      </p>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Bottom Buttons */}
              <div className="pt-6 border-t border-border/40">
                {!isCardFlipped ? (
                  <Button
                    onClick={() => setIsCardFlipped(true)}
                    className="w-full h-11 text-xs font-bold shadow-md"
                  >
                    Show Answer / Recall Anchor
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block text-center">
                      Rate Recall Difficulty (SuperMemo SM-2):
                    </span>
                    <div className="grid grid-cols-4 gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handleRateCard('Again')}
                        className="h-10 text-xs font-bold border-destructive/40 text-destructive hover:bg-destructive/10"
                      >
                        Again (&lt;10m)
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleRateCard('Hard')}
                        className="h-10 text-xs font-bold border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                      >
                        Hard (1d)
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleRateCard('Good')}
                        className="h-10 text-xs font-bold border-primary/40 text-primary hover:bg-primary/10"
                      >
                        Good (4d)
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleRateCard('Easy')}
                        className="h-10 text-xs font-bold border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                      >
                        Easy (7d)
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center bg-card border-border/80 shadow-lg rounded-3xl space-y-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h2 className="text-xl font-bold text-foreground">Zero Due Cards Remaining</h2>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                You’re completely caught up on your spaced reviews for today. New flashcards will unlock based on your SM-2 intervals tomorrow.
              </p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

export default QuizView;
