import { ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../context/AuthContext';

export function Footer({ onGetStarted }) {
  const { isAuthenticated } = useAuth();

  return (
    <footer className="border-t border-border/50 bg-card/60 backdrop-blur-md pt-16 pb-12">
      {/* Pre-footer Call to Action */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center">
        <div className="rounded-3xl bg-gradient-to-b from-primary/10 via-card to-card p-8 sm:p-12 border border-primary/20 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight max-w-xl mx-auto">
            Ready to Turn Every Brief into Permanent Knowledge?
          </h2>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-lg mx-auto">
            Join thousands of scholars, researchers, and civil service aspirants building deep cognitive recall daily.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              onClick={onGetStarted}
              className="h-12 px-8 text-sm font-bold shadow-lg shadow-primary/20 gap-2"
            >
              {isAuthenticated ? 'Open Application' : 'Get Started Free'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-12 border-b border-border/40">
          <div className="col-span-2 md:col-span-1 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-md">
                T
              </div>
              <span className="font-extrabold text-lg text-foreground tracking-tight">Tootler</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The high-signal reading, retention, and spaced learning platform powered by modern cognitive science.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">Product</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><a href="#features" className="hover:text-foreground transition-colors">Feed Ingestion</a></li>
              <li><a href="#features" className="hover:text-foreground transition-colors">Deep Reader</a></li>
              <li><a href="#features" className="hover:text-foreground transition-colors">Spaced Retention Engine</a></li>
              <li><a href="#features" className="hover:text-foreground transition-colors">Cohort Leaderboards</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">Architecture</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><span className="text-muted-foreground">FastAPI Async CSR</span></li>
              <li><span className="text-muted-foreground">PostgreSQL & SQLAlchemy 2.x</span></li>
              <li><span className="text-muted-foreground">SuperMemo SM-2 Model</span></li>
              <li><span className="text-muted-foreground">React 19 & Tailwind CSS v4</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">Community</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><a href="https://x.com" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">Twitter / X</a></li>
              <li><a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">GitHub Repository</a></li>
              <li><a href="https://discord.com" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">Discord Community</a></li>
              <li><a href="mailto:support@tootler.app" className="hover:text-foreground transition-colors">Support Email</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <p>&copy; {new Date().getFullYear()} Tootler Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-foreground cursor-pointer">Privacy Policy</span>
            <span className="hover:text-foreground cursor-pointer">Terms of Service</span>
            <span className="hover:text-foreground cursor-pointer">Security Overview</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
