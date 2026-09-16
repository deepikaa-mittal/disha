import React, { useState, useEffect } from 'react';
import engagementService from '../../services/engagementService';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Flame,
  Trophy,
  Calendar,
  Clock,
  CheckCircle2,
  TrendingUp,
  Award,
  Users
} from 'lucide-react';

export function StreakView() {
  const [streakData, setStreakData] = useState(null);
  const [activityDays, setActivityDays] = useState([]);
  const [leaderboard, setLeaderboard] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const [s, a, l] = await Promise.all([
        engagementService.getStreak(),
        engagementService.getActivityHeatmap(),
        engagementService.getCurrentLeaderboard(),
      ]);
      setStreakData(s);
      setActivityDays(a);
      setLeaderboard(l);
    };
    loadData();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/50">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            Consistency, Streaks & Cohorts
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Track daily reading volume, spaced recall adherence, and your rank within your scholar peer cohort.
          </p>
        </div>

        <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-xs font-bold py-1">
          <Flame className="w-3.5 h-3.5 mr-1 fill-current" /> Active Streak: {streakData?.current_streak_days || 12} Days
        </Badge>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-5 bg-card border-border/70 rounded-2xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Current Streak</span>
            <Flame className="w-4 h-4 text-amber-500 fill-current" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-foreground">
            {streakData?.current_streak_days || 12} <span className="text-sm font-normal text-muted-foreground">Days</span>
          </div>
          <span className="text-[10px] text-emerald-500 font-semibold block">Extended today</span>
        </Card>

        <Card className="p-5 bg-card border-border/70 rounded-2xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Longest Streak</span>
            <Award className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-foreground">
            {streakData?.longest_streak_days || 28} <span className="text-sm font-normal text-muted-foreground">Days</span>
          </div>
          <span className="text-[10px] text-muted-foreground block">Personal record</span>
        </Card>

        <Card className="p-5 bg-card border-border/70 rounded-2xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Today’s Focus</span>
            <Clock className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-foreground">
            {streakData?.today_minutes || 24} <span className="text-sm font-normal text-muted-foreground">/ 30m</span>
          </div>
          <span className="text-[10px] text-emerald-500 font-semibold block">80% of daily goal</span>
        </Card>

        <Card className="p-5 bg-card border-border/70 rounded-2xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Cohort Rank</span>
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-foreground">
            #3 <span className="text-sm font-normal text-muted-foreground">of 25</span>
          </div>
          <span className="text-[10px] text-primary font-semibold block">Diamond League</span>
        </Card>
      </div>

      {/* 28-Day Heatmap Card */}
      <Card className="p-6 bg-card border-border/70 rounded-3xl shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">28-Day Activity & Retention Heatmap</h3>
          </div>
          <span className="text-xs text-muted-foreground">Last 4 Weeks</span>
        </div>

        <div className="grid grid-cols-7 sm:grid-cols-14 gap-2 pt-2">
          {activityDays.map((day, idx) => {
            const hasActivity = day.minutes_read > 0;
            const isHigh = day.minutes_read >= 25;
            return (
              <div
                key={idx}
                className={`h-10 rounded-xl p-1.5 flex flex-col justify-between text-[9px] font-mono border transition-all ${
                  isHigh
                    ? 'bg-primary text-primary-foreground border-primary font-bold shadow-sm'
                    : hasActivity
                    ? 'bg-primary/20 text-foreground border-primary/30'
                    : 'bg-muted/30 text-muted-foreground border-border/40'
                }`}
                title={`${day.activity_date}: ${day.minutes_read} mins read, ${day.cards_reviewed} cards`}
              >
                <span>{new Date(day.activity_date).getDate()}</span>
                <span className="truncate">{day.minutes_read}m</span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/40">
          <span>Darker tiles indicate &gt;25 minutes of deep reading + retention quiz completion.</span>
          <span className="flex items-center gap-1.5 font-semibold text-emerald-500">
            <CheckCircle2 className="w-3 h-3" /> Consistent Daily Habit
          </span>
        </div>
      </Card>

      {/* Cohort Leaderboard */}
      <Card className="p-6 bg-card border-border/70 rounded-3xl shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border/40">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">
              {leaderboard?.cohort_name || 'Diamond Scholars Cohort'}
            </h3>
          </div>
          <Badge variant="outline" className="text-xs font-mono">Weekly Snapshot</Badge>
        </div>

        <div className="space-y-2">
          {leaderboard?.entries?.map((entry) => (
            <div
              key={entry.rank_position}
              className={`p-3.5 rounded-2xl flex items-center justify-between text-xs border transition-all ${
                entry.is_current_user
                  ? 'bg-primary/10 border-primary/40 font-bold shadow-sm'
                  : 'bg-muted/20 border-border/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                    entry.rank_position === 1
                      ? 'bg-amber-500 text-amber-950 font-black'
                      : entry.rank_position === 2
                      ? 'bg-slate-300 text-slate-900 font-black'
                      : entry.rank_position === 3
                      ? 'bg-amber-700 text-amber-100 font-black'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {entry.rank_position}
                </span>

                <div className="flex flex-col">
                  <span className="text-foreground font-semibold">
                    {entry.display_name} {entry.is_current_user && '(You)'}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-normal">
                    @{entry.username}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-right font-mono">
                <div className="flex items-center gap-1 text-amber-500 font-semibold">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span>{entry.streak_days}d</span>
                </div>
                <div className="font-bold text-foreground min-w-[60px]">
                  {entry.score} XP
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default StreakView;
