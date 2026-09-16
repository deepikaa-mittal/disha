import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: 'How does the passwordless OTP login work?',
      a: 'Tootler uses email-based one-time passcodes (OTP) combined with cryptographic JWT access and refresh tokens. You simply enter your email, receive a 6-digit code, and log in securely in seconds without needing to remember another password.',
    },
    {
      q: 'How does the automated X/Twitter source ingestion work?',
      a: 'Tootler connects to specified public accounts, handles, or RSS streams. It pulls new tweets and threads, applies canonical hash deduplication to eliminate reposts and noise, formats the content into clean reading briefs, and extracts key takeaways.',
    },
    {
      q: 'What is the SuperMemo SM-2 Spaced Repetition Algorithm?',
      a: 'SM-2 is a scientifically validated memory scheduling algorithm. When you rate your recall confidence (Again, Hard, Good, Easy), SM-2 calculates the precise interval before the next review, keeping retention rates above 94% with minimal daily review time.',
    },
    {
      q: 'Can I use Tootler on mobile devices and tablets?',
      a: 'Yes! Tootler is fully responsive across desktop, tablets, and smartphones, allowing you to review your retention flashcards during your commute and do deep reading on your desktop.',
    },
    {
      q: 'Is my reading data and personal library secure?',
      a: 'Absolutely. All user annotations, reading lists, quiz attempts, and profile configurations are stored in an encrypted PostgreSQL database protected by request-scoped authentication.',
    },
  ];

  return (
    <section id="faq" className="py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <Badge variant="outline" className="mb-3 text-xs font-semibold text-primary border-primary/30">
          <HelpCircle className="w-3.5 h-3.5 mr-1" /> Frequently Asked Questions
        </Badge>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Everything You Need to Know
        </h2>
        <p className="mt-4 text-base text-muted-foreground">
          Quick answers to common questions about Tootler, retention algorithms, and feed synchronization.
        </p>
      </div>

      <div className="space-y-3.5">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <Card
              key={idx}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isOpen ? 'bg-card border-primary/40 shadow-md' : 'bg-card/40 border-border/60 hover:bg-card/80'
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                className="w-full text-left p-5 flex items-center justify-between gap-4"
              >
                <span className="font-bold text-sm sm:text-base text-foreground">
                  {faq.q}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-muted-foreground transition-transform duration-200 shrink-0 ${
                    isOpen ? 'rotate-180 text-primary' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-5 pb-5 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/30 pt-3">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

export default FaqSection;
