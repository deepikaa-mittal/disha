import React from 'react';
import {
  Home,
  Rss,
  BookOpen,
  Library,
  BrainCircuit,
  Flame,
  Radio,
  Settings,
  TrendingUp,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { Badge } from '../ui/badge';

export function AppSidebar({ activeTab, onSelectTab, activeArticle }) {
  const navItems = [
    { id: 'dashboard', label: 'Home (Dashboard)', icon: Home, badge: 'Live' },
    { id: 'feed', label: 'Curated Feed', icon: Rss, badge: 'Fresh' },
    { id: 'reader', label: 'Deep Reader', icon: BookOpen, badge: activeArticle ? 'Active' : null, disabled: !activeArticle },
    { id: 'quiz', label: 'Revise & Quizzes', icon: BrainCircuit, badge: '4 Due' },
    { id: 'library', label: 'Library & Notes', icon: Library },
    { id: 'streak', label: 'Streaks & Retention', icon: Flame, badge: '12 Days' },
    { id: 'monitor', label: 'X/Twitter Monitor', icon: Radio },
    { id: 'settings', label: 'Me / Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-card/60 backdrop-blur-md border-r border-border/60 p-4 hidden md:flex flex-col justify-between shrink-0 min-h-[calc(100vh-53px)]">
      <div className="space-y-6">
        <div>
          <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Core Learning Loops
          </span>
          <nav className="mt-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isSelected = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={item.disabled}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    item.disabled
                      ? 'opacity-40 cursor-not-allowed text-muted-foreground'
                      : isSelected
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/15'
                      : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <Badge
                      variant={isSelected ? 'secondary' : 'outline'}
                      className={`text-[9px] px-1.5 py-0 h-4 font-mono ${
                        isSelected ? 'bg-primary-foreground/20 text-primary-foreground' : 'text-primary border-primary/30'
                      }`}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Current Active Article Widget */}
        {activeArticle && (
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-semibold text-primary">
              <span className="flex items-center gap-1">
                <BookOpen className="w-3 h-3" /> In Progress
              </span>
              <span>{activeArticle.readTimeMinutes || 4}m read</span>
            </div>
            <p className="text-xs font-bold text-foreground line-clamp-1">
              {activeArticle.title}
            </p>
            <button
              type="button"
              onClick={() => onSelectTab('reader')}
              className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1 pt-1"
            >
              Resume Reading <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Pro Badge / Retention Health card */}
      <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-foreground flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-primary" /> Retention Health
          </span>
          <span className="font-mono text-emerald-500 font-bold">94.8%</span>
        </div>
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full w-[94.8%]" />
        </div>
        <p className="text-[10px] text-muted-foreground leading-tight">
          SM-2 active review schedule is on track for 3 topics.
        </p>
      </div>
    </aside>
  );
}

export default AppSidebar;
