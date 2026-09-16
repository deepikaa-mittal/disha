import React, { useState, useEffect } from 'react';
import feedService from '../../services/feedService';
import readingService from '../../services/readingService';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  BookOpen,
  Bookmark,
  Clock,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

export function FeedView({ onSelectArticle, searchQuery }) {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Cognitive Science', 'Economics & Tech', 'Governance & Law', 'Geopolitics'];

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
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Feed Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/50">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            Curated High-Signal Feed
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Deduplicated insights harvested from your monitored research streams & Twitter accounts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadPosts}
            className="h-8 text-xs font-semibold gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Feed
          </Button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Feed Posts List */}
      {isLoading ? (
        <div className="space-y-4 py-8">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-44 rounded-2xl bg-muted/30 animate-pulse border border-border/40" />
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl border border-border/60 p-8 space-y-3">
          <BookOpen className="w-10 h-10 text-muted-foreground mx-auto" />
          <h3 className="font-bold text-base text-foreground">No briefs found matching your filter</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Try adjusting your search query or category filters to discover more curated knowledge.
          </p>
          <Button size="sm" variant="outline" onClick={() => { setSelectedCategory('All'); }}>
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <Card
              key={post.id}
              onClick={() => onSelectArticle(post)}
              className="p-6 bg-card border-border/70 hover:border-primary/40 transition-all rounded-2xl cursor-pointer shadow-sm hover:shadow-md group relative overflow-hidden"
            >
              {/* Category & Time */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs font-semibold">
                    {post.category || 'General Synthesis'}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {post.readTimeMinutes || 4} MIN READ
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => handleToggleBookmark(post, e)}
                    className={`p-1.5 rounded-lg hover:bg-muted/50 transition-colors ${
                      post.isBookmarked ? 'text-primary fill-primary' : 'text-muted-foreground'
                    }`}
                    title="Bookmark to library"
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Title & Preview Body */}
              <h2 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors tracking-tight mb-2">
                {post.title}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 leading-relaxed mb-4">
                {post.content}
              </p>

              {/* Takeaways Pill Preview */}
              {post.takeaways && post.takeaways.length > 0 && (
                <div className="p-3 rounded-xl bg-muted/30 border border-border/40 text-xs text-foreground/90 space-y-1 mb-4">
                  <span className="font-bold text-[11px] uppercase tracking-wider text-primary flex items-center gap-1">
                    <BookOpen className="w-3 h-3" /> Key Insight
                  </span>
                  <p className="text-xs text-muted-foreground leading-snug line-clamp-1">
                    {post.takeaways[0]}
                  </p>
                </div>
              )}

              {/* Author & Read Action Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-border/40 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">
                    {post.author?.displayName ? post.author.displayName[0] : '@'}
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
  );
}

export default FeedView;
