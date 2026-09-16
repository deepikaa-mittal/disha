import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import feedService from '../../services/feedService';
import readingService from '../../services/readingService';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import {
  BookOpen,
  Bookmark,
  Clock,
  ArrowRight,
  RefreshCw,
  Flame,
  History,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Calendar,
  Layers,
  Search,
  ExternalLink,
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export function DashboardView({
  onSelectArticle,
  onStartQuiz,
  onNavigateTab,
  searchQuery = '',
}) {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isStudyLogOpen, setIsStudyLogOpen] = useState(false);

  const categories = [
    'All',
    'Governance & Law',
    'Economics & Tech',
    'Cognitive Science',
    'Geopolitics',
  ];

  const scholarName =
    profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Scholar';

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const data = await feedService.getPublishedPosts();
      setPosts(data);
    } catch (err) {
      console.warn('Error fetching posts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleToggleBookmark = async (post, e) => {
    e.stopPropagation();
    try {
      if (post.isBookmarked) {
        await readingService.deleteSavedItem(post.id);
        toast.info(`Removed "${post.title}" from library`);
      } else {
        await readingService.saveItem({ post_id: post.id, title: post.title });
        toast.success(`Saved "${post.title}" to library!`);
      }
      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, isBookmarked: !p.isBookmarked } : p))
      );
    } catch (err) {
      toast.error('Failed to update bookmark');
    }
  };

  const filteredPosts = posts.filter((post) => {
    const matchesCategory =
      selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Top Header Row with Date, Greeting, and Streak Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 mb-1">
            <Calendar className="w-3.5 h-3.5" />
            {todayFormatted}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Good day, {scholarName}.
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Your high-signal academic agenda and active recall queue are ready.
          </p>
        </div>

        {/* Clickable Streak Badge */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab('streak')}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-all shadow-sm group"
            title="View Retention & Streak Stats"
          >
            <Flame className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform animate-pulse" />
            <span className="text-xs font-black tracking-wider">12 DAYS STREAK</span>
          </button>
        </div>
      </div>

      {/* Top Bento Cards: Daily Completion & Revision Queue */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Card 1: Daily Completion Progress */}
        <Card
          onClick={() => setIsStudyLogOpen(true)}
          className="p-6 bg-card border-border/70 hover:border-primary/40 rounded-3xl transition-all cursor-pointer shadow-sm hover:shadow-md relative overflow-hidden group"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" /> Daily Completion
              </div>
              <div className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                65% Achieved
              </div>
              <p className="text-xs text-muted-foreground">
                1.5 hours focused study today • Click to view log
              </p>
            </div>

            {/* Circular Progress Display */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-muted/40 stroke-current"
                  strokeWidth="3.5"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-primary stroke-current transition-all duration-1000 ease-out"
                  strokeDasharray="65, 100"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute font-mono text-xs sm:text-sm font-black text-foreground">
                65%
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1 font-medium">
              <GraduationCap className="w-3.5 h-3.5 text-primary" /> Target: 2.0 hrs/day
            </span>
            <span className="text-primary font-bold text-[11px] group-hover:underline flex items-center gap-1">
              Focus Log <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </Card>

        {/* Card 2: Spaced Repetition Revision Queue */}
        <Card className="p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/30 rounded-3xl transition-all shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-primary" /> Revision Queue
              </div>
              <Badge variant="outline" className="text-[10px] font-bold border-primary/30 text-primary">
                Due Today
              </Badge>
            </div>

            <div className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              4 items due for review
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Strengthen your retention from yesterday's sessions on Governance & Constitutional Law.
            </p>
          </div>

          <div className="pt-4">
            <Button
              onClick={onStartQuiz}
              className="w-full h-11 text-xs sm:text-sm font-bold tracking-wide shadow-md gap-2 bg-primary hover:bg-primary/90"
            >
              <Sparkles className="w-4 h-4" />
              Start Revision Quiz
              <ArrowRight className="w-4 h-4 ml-auto" />
            </Button>
          </div>
        </Card>
      </div>

      {/* Daily Briefs Section */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Curated Academic Briefs
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Verified daily synthesis from The Hindu, PIB, and PRS Legislative.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={loadPosts}
            className="h-8 text-xs font-semibold gap-1.5 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Briefs Cards List */}
        {isLoading ? (
          <div className="space-y-4 py-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-44 rounded-3xl bg-muted/30 animate-pulse border border-border/40"
              />
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-3xl border border-border/60 p-8 space-y-3">
            <BookOpen className="w-10 h-10 text-muted-foreground mx-auto" />
            <h3 className="font-bold text-base text-foreground">No briefs found matching your filter</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Try switching category filters or clearing the search bar.
            </p>
            <Button size="sm" variant="outline" onClick={() => setSelectedCategory('All')}>
              Reset Filter
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <Card
                key={post.id}
                onClick={() => onSelectArticle(post)}
                className="p-6 bg-card border-border/70 hover:border-primary/40 transition-all rounded-3xl cursor-pointer shadow-sm hover:shadow-md group relative overflow-hidden"
              >
                {/* Source & Read Time Header */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs font-bold tracking-wider uppercase">
                      {post.author?.displayName || post.category || 'THE HINDU'}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3" /> {post.readTimeMinutes || 4} MIN READ
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleToggleBookmark(post, e)}
                    className={`p-1.5 rounded-lg hover:bg-muted/60 transition-colors ${
                      post.isBookmarked ? 'text-primary fill-primary' : 'text-muted-foreground'
                    }`}
                    title="Bookmark to library"
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>
                </div>

                {/* Title & Preview Content */}
                <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors tracking-tight mb-2">
                  {post.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 leading-relaxed mb-4">
                  {post.content}
                </p>

                {/* Key Insight Pill */}
                {post.takeaways && post.takeaways.length > 0 && (
                  <div className="p-3 rounded-2xl bg-muted/30 border border-border/40 text-xs text-foreground/90 space-y-1 mb-4">
                    <span className="font-bold text-[11px] uppercase tracking-wider text-primary flex items-center gap-1">
                      <BookOpen className="w-3 h-3" /> Core Key Insight
                    </span>
                    <p className="text-xs text-muted-foreground leading-snug line-clamp-1">
                      {post.takeaways[0]}
                    </p>
                  </div>
                )}

                {/* Card Action Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-border/40 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">
                      {post.author?.displayName ? post.author.displayName[0] : 'S'}
                    </div>
                    <span className="font-semibold text-foreground truncate max-w-[140px] sm:max-w-none">
                      {post.author?.displayName || post.author?.username || 'Verified Source'}
                    </span>
                  </div>

                  <span className="text-xs font-bold text-primary flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Read & Retain <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Focus Session Log Dialog */}
      <Dialog open={isStudyLogOpen} onOpenChange={setIsStudyLogOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border/70 rounded-3xl p-6 shadow-2xl">
          <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Focus Session Log
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Summary of your active reading sessions for today.
          </DialogDescription>

          <div className="space-y-3 py-3">
            {[
              { time: '09:00 AM - 10:00 AM', subject: 'Governance & Public Policy', duration: '1.0 hr' },
              { time: '11:30 AM - 12:00 PM', subject: 'Constitutional Law Doctrine', duration: '0.5 hr' },
              { time: '02:00 PM - 02:30 PM', subject: 'Semiconductor Supply Chains', duration: '0.5 hr' },
            ].map((log, i) => (
              <div
                key={i}
                className="p-3.5 rounded-2xl bg-muted/40 border border-border/40 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-foreground">{log.subject}</div>
                  <div className="text-[11px] text-muted-foreground">{log.time}</div>
                </div>
                <Badge variant="secondary" className="font-mono text-xs font-bold">
                  {log.duration}
                </Badge>
              </div>
            ))}
          </div>

          <Button onClick={() => setIsStudyLogOpen(false)} className="w-full h-11 text-xs font-bold">
            Done
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default DashboardView;
