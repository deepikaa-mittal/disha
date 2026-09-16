import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from './components/ui/sonner';

// Landing Page Components
import { LandingNavbar } from './components/landing/LandingNavbar';
import { HeroSection } from './components/landing/HeroSection';
import { SocialProof } from './components/landing/SocialProof';
import { FeatureMatrix } from './components/landing/FeatureMatrix';
import { InteractiveDemo } from './components/landing/InteractiveDemo';
import { HowItWorks } from './components/landing/HowItWorks';
import { PricingSection } from './components/landing/PricingSection';
import { FaqSection } from './components/landing/FaqSection';
import { Footer } from './components/landing/Footer';

// App Experience Components
import { AppNavbar } from './components/app/AppNavbar';
import { AppSidebar } from './components/app/AppSidebar';
import { DashboardView } from './components/app/DashboardView';
import { FeedView } from './components/app/FeedView';
import { ReaderView } from './components/app/ReaderView';
import { LibraryView } from './components/app/LibraryView';
import { QuizView } from './components/app/QuizView';
import { StreakView } from './components/app/StreakView';
import { MonitorView } from './components/app/MonitorView';
import { SettingsView } from './components/app/SettingsView';

// Onboarding Flow Component
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';

// Auth Dialog
import { AuthDialog } from './components/auth/AuthDialog';

function MainApp() {
  const { isAuthenticated, isOnboardingComplete, openLoginModal } = useAuth();
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'onboarding' | 'app'
  const [activeAppTab, setActiveAppTab] = useState('dashboard'); // 'dashboard' | 'feed' | 'reader' | 'library' | 'quiz' | 'streak' | 'monitor' | 'settings'
  const [activeArticle, setActiveArticle] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Handle post-login navigation to onboarding or dashboard
  useEffect(() => {
    if (isAuthenticated) {
      if (!isOnboardingComplete) {
        setCurrentView('onboarding');
      } else if (currentView === 'landing') {
        setCurrentView('app');
      }
    }
  }, [isAuthenticated, isOnboardingComplete]);

  const handleStartApp = () => {
    if (isAuthenticated) {
      if (!isOnboardingComplete) {
        setCurrentView('onboarding');
      } else {
        setCurrentView('app');
      }
    } else {
      openLoginModal();
    }
  };

  const handleOpenArticle = (article) => {
    setActiveArticle(article);
    setActiveAppTab('reader');
    if (currentView !== 'app') {
      setCurrentView('app');
    }
  };

  const handleStartQuizForArticle = (article) => {
    setActiveAppTab('quiz');
  };

  const handleFinishOnboarding = () => {
    setCurrentView('app');
    setActiveAppTab('dashboard');
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
      {currentView === 'landing' ? (
        <>
          <LandingNavbar
            onNavigateApp={handleStartApp}
          />
          <main className="flex-1">
            <HeroSection
              onGetStarted={handleStartApp}
              onExploreDemo={() => {
                const el = document.getElementById('demo');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />
            <SocialProof />
            <FeatureMatrix onGetStarted={handleStartApp} />
            <InteractiveDemo />
            <HowItWorks />
            <PricingSection onGetStarted={handleStartApp} />
            <FaqSection />
          </main>
          <Footer onGetStarted={handleStartApp} />
        </>
      ) : currentView === 'onboarding' ? (
        <OnboardingFlow onComplete={handleFinishOnboarding} />
      ) : (
        <div className="min-h-screen flex flex-col bg-background">
          <AppNavbar
            activeTab={activeAppTab}
            onSelectTab={setActiveAppTab}
            onReturnHome={() => setCurrentView('landing')}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          <div className="flex-1 flex overflow-hidden">
            <AppSidebar
              activeTab={activeAppTab}
              onSelectTab={setActiveAppTab}
              activeArticle={activeArticle}
            />

            <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-h-[calc(100vh-53px)]">
              {activeAppTab === 'dashboard' && (
                <DashboardView
                  onSelectArticle={handleOpenArticle}
                  onStartQuiz={() => setActiveAppTab('quiz')}
                  onNavigateTab={(tab) => setActiveAppTab(tab)}
                  searchQuery={searchQuery}
                />
              )}

              {activeAppTab === 'feed' && (
                <FeedView
                  onSelectArticle={handleOpenArticle}
                  searchQuery={searchQuery}
                />
              )}

              {activeAppTab === 'reader' && (
                <ReaderView
                  article={activeArticle}
                  onBack={() => setActiveAppTab('dashboard')}
                  onStartQuiz={handleStartQuizForArticle}
                />
              )}

              {activeAppTab === 'library' && (
                <LibraryView onSelectArticle={handleOpenArticle} />
              )}

              {activeAppTab === 'quiz' && <QuizView />}

              {activeAppTab === 'streak' && <StreakView />}

              {activeAppTab === 'monitor' && <MonitorView />}

              {activeAppTab === 'settings' && <SettingsView />}
            </main>
          </div>
        </div>
      )}

      {/* Global Passwordless Auth Modal */}
      <AuthDialog />

      {/* Global Toast Provider */}
      <Toaster position="bottom-right" richColors />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
