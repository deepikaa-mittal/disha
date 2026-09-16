import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import {
  Flame,
  Search,
  Sun,
  Moon,
  LogOut,
  User,
  BookOpen,
  ArrowLeft,
  Settings,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

export function AppNavbar({ activeTab, onSelectTab, onReturnHome, searchQuery, setSearchQuery }) {
  const { user, profile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await logout();
    if (onReturnHome) onReturnHome();
  };

  return (
    <header className="sticky top-0 z-40 bg-card/85 backdrop-blur-md border-b border-border/60 px-4 sm:px-6 py-2.5">
      <div className="flex items-center justify-between gap-4">
        {/* Brand / Logo & Back to Landing */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onReturnHome}
            className="flex items-center gap-2.5 group text-left"
            title="Return to Public Landing Page"
          >
            <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-black text-sm shadow-md group-hover:scale-105 transition-transform">
              T
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="font-extrabold text-sm tracking-tight text-foreground flex items-center gap-1">
                Tootler <ArrowLeft className="w-3 h-3 text-muted-foreground group-hover:-translate-x-0.5 transition-transform" />
              </span>
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">
                Scholar Suite
              </span>
            </div>
          </button>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search briefs, concepts, legal precedents, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 text-xs bg-muted/30 border-border/50 focus-visible:ring-primary rounded-lg"
            />
          </div>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Streak Indicator */}
          <button
            type="button"
            onClick={() => onSelectTab('streak')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold hover:bg-amber-500/15 transition-colors"
          >
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>12 Days</span>
          </button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="w-8 h-8 text-muted-foreground hover:text-foreground"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="h-8 gap-2 px-2.5 text-xs font-semibold rounded-lg hover:bg-muted/50 inline-flex items-center text-foreground outline-none cursor-pointer border border-border/40 transition-colors">
              <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px]">
                {profile?.full_name ? profile.full_name[0] : (user?.email ? user.email[0].toUpperCase() : 'U')}
              </div>
              <span className="hidden md:inline text-foreground max-w-[100px] truncate">
                {profile?.full_name || user?.email?.split('@')[0] || 'Scholar'}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-card border-border/80 shadow-xl">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-bold leading-none text-foreground">
                    {profile?.full_name || 'Scholar Profile'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground truncate">
                    {user?.email || 'scholar@tootler.app'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onSelectTab('settings')} className="cursor-pointer text-xs">
                <Settings className="w-3.5 h-3.5 mr-2" /> Study Preferences & Focus
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSelectTab('streak')} className="cursor-pointer text-xs">
                <Flame className="w-3.5 h-3.5 mr-2 text-amber-500" /> Retention Streak & Cohorts
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onReturnHome} className="cursor-pointer text-xs">
                <BookOpen className="w-3.5 h-3.5 mr-2" /> Landing Page
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-xs text-destructive focus:text-destructive">
                <LogOut className="w-3.5 h-3.5 mr-2" /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export default AppNavbar;
