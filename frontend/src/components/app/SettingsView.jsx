import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import profileService from '../../services/profileService';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  User,
  Sliders,
  CheckCircle2,
  Layers,
  Save,
} from 'lucide-react';
import { toast } from 'sonner';

export function SettingsView() {
  const { user, profile, setProfile, resetOnboarding } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || 'Alex Mercer');
  const [academicStanding, setAcademicStanding] = useState(profile?.academic_standing || 'Civil Services Scholar');
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(30);
  const [autoQuiz, setAutoQuiz] = useState(true);
  const [emailDigest, setEmailDigest] = useState(true);
  const [focusAreas, setFocusAreas] = useState([
    'Governance & Law',
    'Cognitive Science',
    'Tech Sovereignty',
    'Economics',
  ]);

  const allTopics = [
    'Governance & Law',
    'Cognitive Science',
    'Tech Sovereignty',
    'Economics',
    'International Relations',
    'Ancient History',
    'Environmental Ecology',
  ];

  const toggleFocusArea = (topic) => {
    if (focusAreas.includes(topic)) {
      setFocusAreas(focusAreas.filter((t) => t !== topic));
    } else {
      setFocusAreas([...focusAreas, topic]);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const updated = {
      full_name: fullName,
      academic_standing: academicStanding,
      focus_areas: focusAreas,
    };
    await profileService.updateProfile(updated);
    setProfile(updated);
    toast.success('Profile preferences updated successfully!');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-border/50">
        <h1 className="text-2xl font-black tracking-tight text-foreground">
          Scholar Profile & Preferences
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Customize your daily cognitive workload, focus areas, and account credentials.
        </p>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Profile Card */}
        <Card className="p-6 sm:p-7 bg-card border-border/70 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border/40">
            <User className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Personal Details</h3>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="settings-full-name" className="text-xs font-semibold text-muted-foreground">Display Name</label>
              <Input
                id="settings-full-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-10 text-xs bg-muted/30"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="settings-email" className="text-xs font-semibold text-muted-foreground">Account Email</label>
              <Input
                id="settings-email"
                type="email"
                disabled
                value={user?.email || 'scholar@tootler.app'}
                className="h-10 text-xs bg-muted/20 opacity-70 cursor-not-allowed"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label htmlFor="settings-academic-standing" className="text-xs font-semibold text-muted-foreground">Target Focus / Academic Standing</label>
              <Input
                id="settings-academic-standing"
                type="text"
                value={academicStanding}
                onChange={(e) => setAcademicStanding(e.target.value)}
                className="h-10 text-xs bg-muted/30"
              />
            </div>
          </div>
        </Card>

        {/* Study Goals */}
        <Card className="p-6 sm:p-7 bg-card border-border/70 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border/40">
            <Sliders className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Daily Study Target</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">Daily Reading Goal:</span>
              <span className="font-mono font-bold text-primary">{dailyGoalMinutes} Minutes / Day</span>
            </div>
            <input
              type="range"
              min="10"
              max="120"
              step="5"
              value={dailyGoalMinutes}
              onChange={(e) => setDailyGoalMinutes(Number(e.target.value))}
              className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
            />
          </div>

          <div className="pt-2 space-y-2">
            <label className="flex items-center gap-2.5 text-xs text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={autoQuiz}
                onChange={(e) => setAutoQuiz(e.target.checked)}
                className="rounded text-primary focus:ring-primary h-4 w-4"
              />
              <span>Automatically generate morning 3-minute quiz from yesterday’s readings</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={emailDigest}
                onChange={(e) => setEmailDigest(e.target.checked)}
                className="rounded text-primary focus:ring-primary h-4 w-4"
              />
              <span>Send weekly retention digest & cohort rank summary via email</span>
            </label>
          </div>
        </Card>

        {/* Focus Areas Catalog */}
        <Card className="p-6 sm:p-7 bg-card border-border/70 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border/40">
            <Layers className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Active Focus Areas</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Select the domains you want prioritized in your daily curated feeds and quiz generation.
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {allTopics.map((topic) => {
              const isSelected = focusAreas.includes(topic);
              return (
                <button
                  key={topic}
                  type="button"
                  onClick={() => toggleFocusArea(topic)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-muted/30 text-muted-foreground border-border/60 hover:border-border'
                  }`}
                >
                  {isSelected && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                  {topic}
                </button>
              );
            })}
          </div>
        </Card>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              resetOnboarding();
              window.location.reload();
            }}
            className="w-full sm:w-auto h-11 text-xs font-semibold text-muted-foreground hover:text-foreground border-border/70"
          >
            Re-run Diagnostic & Onboarding Tour
          </Button>

          <Button type="submit" size="lg" className="w-full sm:w-auto h-11 px-7 text-xs font-bold gap-2 shadow-md">
            <Save className="w-4 h-4" /> Save Preferences
          </Button>
        </div>
      </form>
    </div>
  );
}

export default SettingsView;
