import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Mail, KeyRound, ArrowRight, CheckCircle2, ShieldCheck, Loader2, Sparkles, Copy, Check, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export function AuthDialog() {
  const { isAuthModalOpen, closeLoginModal, authStep, pendingEmail, currentOtp, requestOtp, verifyOtp, openLoginModal } = useAuth();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Auto pre-populate when currentOtp becomes available
  useEffect(() => {
    if (authStep === 'otp' && currentOtp) {
      setOtp(currentOtp);
    }
  }, [authStep, currentOtp]);

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setIsSubmitting(true);
    await requestOtp(email);
    setIsSubmitting(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 4) return;
    setIsSubmitting(true);
    await verifyOtp(otp);
    setIsSubmitting(false);
    setOtp('');
  };

  const handleCopyOtp = () => {
    if (currentOtp) {
      navigator.clipboard.writeText(currentOtp);
      setCopied(true);
      toast.success('OTP copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAutoFill = () => {
    if (currentOtp) {
      setOtp(currentOtp);
      toast.success(`Auto-filled OTP: ${currentOtp}`);
    }
  };

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={(open) => !open && closeLoginModal()}>
      <DialogContent className="sm:max-w-md bg-card border-border/60 shadow-2xl p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 pb-4 border-b border-border/40">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-md">
              T
            </div>
            <span className="font-bold tracking-tight text-lg">Tootler</span>
            <Badge variant="outline" className="ml-auto text-xs font-medium border-primary/30 text-primary">
              <ShieldCheck className="w-3 h-3 mr-1" /> Passwordless OTP
            </Badge>
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            {authStep === 'email' ? 'Welcome to Tootler' : 'Enter Verification Code'}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            {authStep === 'email'
              ? 'Enter your email to receive a secure, passwordless one-time verification code.'
              : `Enter the code sent to ${pendingEmail || 'your email'}.`}
          </DialogDescription>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {authStep === 'email' ? (
              <motion.form
                key="email-step"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleSendEmail}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label htmlFor="auth-email-input" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Work or Study Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                    <Input
                      id="auth-email-input"
                      type="email"
                      placeholder="scholar@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9 h-11 bg-background/50 border-input focus-visible:ring-primary"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || !email}
                  className="w-full h-11 text-sm font-semibold tracking-wide shadow-md"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      Send One-Time Code
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>

                <div className="pt-2">
                  <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground flex items-center gap-2 border border-border/40">
                    <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                    <span>No passwords to remember. Instant access with high-speed JWT rotation.</span>
                  </div>
                </div>
              </motion.form>
            ) : (
              <motion.form
                key="otp-step"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleVerifyOtp}
                className="space-y-4"
              >
                {/* Visual OTP Display Banner */}
                {currentOtp && (
                  <div className="rounded-xl border border-primary/30 bg-primary/10 p-3.5 text-center relative overflow-hidden shadow-inner">
                    <div className="flex items-center justify-between text-xs font-semibold text-primary mb-1">
                      <span className="flex items-center gap-1.5 uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
                        Your Login OTP
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyOtp}
                        className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-background/40 transition-colors"
                      >
                        {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    </div>

                    <div className="my-1.5 flex items-center justify-center gap-1.5">
                      {currentOtp.split('').map((char, index) => (
                        <span
                          key={index}
                          className="w-9 h-11 flex items-center justify-center font-mono text-2xl font-black rounded-lg bg-background/80 border border-primary/30 text-primary shadow-sm tracking-normal"
                        >
                          {char}
                        </span>
                      ))}
                    </div>

                    <div className="mt-2 flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={handleAutoFill}
                        className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1 bg-primary/15 hover:bg-primary/25 px-2.5 py-1 rounded-full transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Click to Auto-fill ({currentOtp})
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="auth-otp-input" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Enter 6-Digit Code
                    </label>
                    <button
                      type="button"
                      onClick={() => requestOtp(pendingEmail)}
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      Resend code
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                    <Input
                      id="auth-otp-input"
                      type="text"
                      maxLength={6}
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="pl-9 h-11 text-center font-mono text-lg font-bold tracking-widest bg-background/50 border-input focus-visible:ring-primary"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || otp.length < 4}
                  className="w-full h-11 text-sm font-semibold tracking-wide shadow-md"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify & Log In
                      <CheckCircle2 className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>

                <div className="pt-1 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={openLoginModal}
                    className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Use a different email
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AuthDialog;
