import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Sun, Moon, ArrowRight, Menu, X, LayoutDashboard } from 'lucide-react';

export function LandingNavbar({ onNavigateApp }) {
  const { isAuthenticated, openLoginModal } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-background/80 glass-nav border-b border-border/40 py-3 shadow-sm'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-md ring-1 ring-primary/20">
            T
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
              Tootler
            </span>
            <span className="text-[10px] uppercase font-semibold tracking-widest text-primary/80 -mt-1">
              Active Retention
            </span>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#demo" className="hover:text-foreground transition-colors flex items-center gap-1.5">
            Interactive Demo
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 uppercase font-bold text-primary">Live</Badge>
          </a>
          <a href="#how-it-works" className="hover:text-foreground transition-colors">
            How It Works
          </a>
          <a href="#pricing" className="hover:text-foreground transition-colors">
            Pricing
          </a>
          <a href="#faq" className="hover:text-foreground transition-colors">
            FAQ
          </a>
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="w-9 h-9 text-muted-foreground hover:text-foreground rounded-lg"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>

          {isAuthenticated ? (
            <Button
              onClick={onNavigateApp}
              className="font-semibold shadow-md gap-2"
            >
              <LayoutDashboard className="w-4 h-4" />
              Open Dashboard
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={openLoginModal}
                className="text-sm font-medium hover:text-foreground"
              >
                Sign In
              </Button>
              <Button
                onClick={openLoginModal}
                className="font-semibold shadow-md gap-1.5"
              >
                Start Free
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="w-9 h-9"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-card/95 border-b border-border/60 p-4 space-y-3 glass-nav">
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Features
          </a>
          <a
            href="#demo"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Interactive Demo
          </a>
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            How It Works
          </a>
          <a
            href="#pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Pricing
          </a>
          <a
            href="#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            FAQ
          </a>
          <div className="pt-2 flex flex-col gap-2">
            {isAuthenticated ? (
              <Button onClick={() => { setMobileMenuOpen(false); onNavigateApp(); }} className="w-full">
                Open Dashboard
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => { setMobileMenuOpen(false); openLoginModal(); }} className="w-full">
                  Sign In
                </Button>
                <Button onClick={() => { setMobileMenuOpen(false); openLoginModal(); }} className="w-full">
                  Start Free
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default LandingNavbar;
