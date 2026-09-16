import React, { useState, useEffect } from 'react';
import readingService from '../../services/readingService';
import feedService from '../../services/feedService';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  ArrowLeft,
  Bookmark,
  BookOpen,
  BrainCircuit,
  Sliders,
  Volume2,
  CheckCircle2,
  Highlighter,
  Sparkles,
  Share2,
} from 'lucide-react';
import { toast } from 'sonner';

export function ReaderView({ article, onBack, onStartQuiz }) {
  const currentArticle = article || feedService.getFallbackPosts()[0];

  const [fontSize, setFontSize] = useState(17);
  const [readerTheme, setReaderTheme] = useState('default'); // 'default' | 'sepia' | 'darker'
  const [progressPercent, setProgressPercent] = useState(10);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [annotations, setAnnotations] = useState([]);
  const [newHighlight, setNewHighlight] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(currentArticle?.isBookmarked || false);

  useEffect(() => {
    setIsBookmarked(currentArticle?.isBookmarked || false);
  }, [currentArticle]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        const percent = Math.min(100, Math.max(10, Math.round((scrollY / docHeight) * 100)));
        setProgressPercent(percent);
        if (currentArticle?.id) {
          readingService.updateProgress(currentArticle.id, percent, 2);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentArticle]);

  const toggleBookmark = async () => {
    setIsBookmarked(!isBookmarked);
    if (!isBookmarked) {
      await readingService.saveItem({ post_id: currentArticle.id, title: currentArticle.title });
      toast.success('Saved to library');
    } else {
      await readingService.deleteSavedItem(currentArticle.id);
      toast.info('Removed from library');
    }
  };

  const toggleAudio = () => {
    setIsPlayingAudio(!isPlayingAudio);
    if (!isPlayingAudio) {
      toast.info('Audio narration started (Neural Scholar Voice)');
    } else {
      toast.info('Audio paused');
    }
  };

  const handleAddAnnotation = (e) => {
    e.preventDefault();
    if (!newHighlight.trim()) return;
    const note = {
      id: Date.now(),
      text: newHighlight.trim(),
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setAnnotations([note, ...annotations]);
    setNewHighlight('');
    toast.success('Annotation saved to your study notes!');
  };

  const articleContent = currentArticle.content || currentArticle.body_markdown || currentArticle.body || 'No text content available for this brief.';
  const paragraphs = typeof articleContent === 'string' ? articleContent.split('\n\n') : [String(articleContent)];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Sticky Top Reader Controls */}
      <div className="sticky top-14 z-30 bg-card/90 backdrop-blur-md border border-border/60 rounded-2xl p-3 shadow-md flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="h-8 px-2.5 text-xs font-semibold gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Button>

          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-border/50 text-xs text-muted-foreground">
            <span>Progress:</span>
            <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-200"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="font-mono text-[11px]">{progressPercent}%</span>
          </div>
        </div>

        {/* Reader Customization Toolbar */}
        <div className="flex items-center gap-1.5">
          {/* Font Size Adjusters */}
          <div className="hidden md:flex items-center bg-muted/40 rounded-lg p-0.5 border border-border/50">
            <button
              type="button"
              onClick={() => setFontSize(Math.max(14, fontSize - 1))}
              className="px-2 py-0.5 text-xs font-bold text-muted-foreground hover:text-foreground"
              title="Decrease text size"
            >
              A-
            </button>
            <span className="text-[10px] font-mono px-1 text-muted-foreground">{fontSize}px</span>
            <button
              type="button"
              onClick={() => setFontSize(Math.min(24, fontSize + 1))}
              className="px-2 py-0.5 text-xs font-bold text-muted-foreground hover:text-foreground"
              title="Increase text size"
            >
              A+
            </button>
          </div>

          {/* Theme Switcher */}
          <div className="flex items-center gap-1 bg-muted/40 rounded-lg p-0.5 border border-border/50">
            <button
              type="button"
              onClick={() => setReaderTheme('default')}
              className={`w-6 h-6 rounded text-xs font-bold ${
                readerTheme === 'default' ? 'bg-background shadow-xs text-foreground' : 'text-muted-foreground'
              }`}
              title="Default Theme"
            >
              D
            </button>
            <button
              type="button"
              onClick={() => setReaderTheme('sepia')}
              className={`w-6 h-6 rounded text-xs font-bold ${
                readerTheme === 'sepia' ? 'bg-[#f4ecd8] text-[#5b4636] shadow-xs' : 'text-muted-foreground'
              }`}
              title="Sepia Academic"
            >
              S
            </button>
          </div>

          {/* Audio Narration Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleAudio}
            className={`h-8 px-2 text-xs font-semibold gap-1 ${
              isPlayingAudio ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isPlayingAudio ? 'Playing' : 'Listen'}</span>
          </Button>

          {/* Bookmark */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleBookmark}
            className={`h-8 w-8 ${isBookmarked ? 'text-primary' : 'text-muted-foreground'}`}
            title="Bookmark this brief"
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-primary' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Main Reading Canvas */}
      <Card
        className={`p-6 sm:p-10 rounded-3xl border-border/80 shadow-lg ${
          readerTheme === 'sepia'
            ? 'bg-[#fbf0d9] text-[#433422] border-[#e8d7be]'
            : 'bg-card text-foreground'
        }`}
      >
        {/* Category & Meta */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border/40">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-semibold text-xs">
              {currentArticle.category || 'General Synthesis'}
            </Badge>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground font-mono">
              {currentArticle.readTimeMinutes || 4} MIN READ
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            Published {new Date(currentArticle.createdAt || Date.now()).toLocaleDateString()}
          </span>
        </div>

        {/* Article Headline */}
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-foreground mt-6 mb-4 leading-tight">
          {currentArticle.title || currentArticle.headline || 'Curated Academic Brief'}
        </h1>

        {/* Author Details */}
        <div className="flex items-center gap-3 pb-8 border-b border-border/40 mb-8">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
            {currentArticle.author?.displayName ? currentArticle.author.displayName[0] : '@'}
          </div>
          <div>
            <div className="font-bold text-sm text-foreground">
              {currentArticle.author?.displayName || currentArticle.author?.username || 'Verified Domain Author'}
            </div>
            <div className="text-xs text-muted-foreground">
              @{currentArticle.author?.username || 'tootler_feed'} • Curated Ingestion Stream
            </div>
          </div>
        </div>

        {/* Key Takeaways Callout */}
        {currentArticle.takeaways && currentArticle.takeaways.length > 0 && (
          <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20 space-y-3 mb-8">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <BookOpen className="w-4 h-4" /> 3-Minute Cognitive Takeaways
            </div>
            <ul className="space-y-2">
              {currentArticle.takeaways.map((takeaway, tidx) => (
                <li key={tidx} className="flex items-start gap-2.5 text-xs sm:text-sm font-medium text-foreground/90">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{takeaway}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Article Full Body */}
        <div
          className="space-y-6 leading-relaxed text-foreground/90 transition-all font-serif sm:font-sans"
          style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}
        >
          {paragraphs.map((paragraph, pidx) => (
            <p key={pidx} className="selection:bg-primary/25">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Sections if present */}
        {currentArticle.sections && currentArticle.sections.length > 0 && (
          <div className="mt-10 space-y-6 pt-6 border-t border-border/40">
            {currentArticle.sections.map((sec, sidx) => (
              <div key={sidx} className="space-y-2">
                <h3 className="text-lg font-bold text-foreground">{sec.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{sec.content}</p>
              </div>
            ))}
          </div>
        )}

        {/* Key Vocabulary Flashcards */}
        {currentArticle.vocabulary && currentArticle.vocabulary.length > 0 && (
          <div className="mt-10 pt-8 border-t border-border/40 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" /> Key Vocabulary & Concepts
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {currentArticle.vocabulary.map((vocab, vidx) => (
                <div key={vidx} className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-1">
                  <span className="font-bold text-xs text-primary">{vocab.term}</span>
                  <p className="text-xs text-muted-foreground leading-relaxed">{vocab.def}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Call to Action: Start Retrieval Quiz */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Active Spaced Retrieval
            </span>
            <h4 className="text-base font-bold text-foreground mt-0.5">
              Ready to cement this insight into long-term memory?
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Complete the 3-question adaptive quiz generated for this brief.
            </p>
          </div>

          <Button
            onClick={() => onStartQuiz && onStartQuiz(currentArticle)}
            className="h-11 px-6 text-xs font-bold shrink-0 shadow-md gap-2"
          >
            <BrainCircuit className="w-4 h-4" />
            Take 2-Min Quiz
          </Button>
        </div>
      </Card>

      {/* Annotations & Highlights Scratchpad */}
      <Card className="p-6 rounded-3xl bg-card border-border/70 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <div className="flex items-center gap-2">
            <Highlighter className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Scholar Margin Notes & Annotations</h3>
          </div>
          <Badge variant="outline" className="text-xs font-mono">
            {annotations.length} Notes
          </Badge>
        </div>

        <form onSubmit={handleAddAnnotation} className="flex gap-2">
          <input
            type="text"
            placeholder="Type a key takeaway, citation reference, or question..."
            value={newHighlight}
            onChange={(e) => setNewHighlight(e.target.value)}
            className="flex-1 h-10 px-3.5 rounded-xl bg-background/60 border border-input text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Button type="submit" size="sm" className="h-10 text-xs font-bold">
            Add Note
          </Button>
        </form>

        {annotations.length > 0 && (
          <div className="space-y-2 pt-2">
            {annotations.map((note) => (
              <div
                key={note.id}
                className="p-3 rounded-xl bg-muted/30 border border-border/50 text-xs text-foreground flex items-center justify-between gap-4"
              >
                <span>"{note.text}"</span>
                <span className="text-[10px] text-muted-foreground shrink-0 font-mono">
                  {note.createdAt}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

export default ReaderView;
