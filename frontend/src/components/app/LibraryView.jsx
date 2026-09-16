import React, { useState, useEffect } from 'react';
import libraryService from '../../services/libraryService';
import readingService from '../../services/readingService';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Library,
  BookOpen,
  Bookmark,
  ArrowRight,
  ListOrdered,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';

export function LibraryView({ onSelectArticle }) {
  const [activeTab, setActiveTab] = useState('saved'); // 'saved' | 'books' | 'collections' | 'lists'
  const [books, setBooks] = useState([]);
  const [collections, setCollections] = useState([]);
  const [readingLists, setReadingLists] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLibrary = async () => {
      setIsLoading(true);
      try {
        const [b, c, rl, s] = await Promise.all([
          libraryService.getBooks(),
          libraryService.getCollections(),
          libraryService.getReadingLists(),
          readingService.getSavedItems(),
        ]);
        setBooks(b || []);
        setCollections(c || []);
        setReadingLists(rl || []);
        setSavedItems(s || []);
      } catch (err) {
        console.warn('Library loading error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadLibrary();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Library Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/50">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            Personal Knowledge Library
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Your saved briefs, foundational books, curated study collections, and active reading lists.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => toast.info('New collection created (Default: Prelims 2026)')}
            className="h-8 text-xs font-semibold gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> New Collection
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 pb-2 border-b border-border/40">
        <button
          type="button"
          onClick={() => setActiveTab('saved')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'saved' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" /> Saved Briefs
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('books')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'books' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" /> Core Books ({books.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('collections')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'collections' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Library className="w-3.5 h-3.5" /> Collections ({collections.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('lists')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'lists' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <ListOrdered className="w-3.5 h-3.5" /> Reading Lists ({readingLists.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'saved' && (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Card
              onClick={() =>
                onSelectArticle({
                  id: 'post-1',
                  title: 'The Art of Deliberate Focus in High-Noise Environments',
                  content:
                    'Modern knowledge work is defined by constant interruption. Deep work requires an architectural approach to attention management.\n\nTo achieve sustained cognitive flow, you must treat your attention like a finite battery. Protect your first 90 minutes of the morning for high-leverage synthesis rather than reactive triage.',
                  category: 'Cognitive Science',
                  readTimeMinutes: 4,
                  takeaways: ['Attention is non-renewable.', 'Apply progressive summarization across 3 passes.'],
                })
              }
              className="p-5 bg-card border-border/70 hover:border-primary/40 rounded-2xl cursor-pointer shadow-sm hover:shadow-md transition-all space-y-2"
            >
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <Badge variant="secondary" className="text-[10px]">Cognitive Science</Badge>
                <span>Saved 2 days ago</span>
              </div>
              <h3 className="font-bold text-sm text-foreground">The Art of Deliberate Focus in High-Noise Environments</h3>
              <p className="text-xs text-muted-foreground line-clamp-2">
                Modern knowledge work is defined by constant interruption. Deep work requires an architectural approach...
              </p>
              <span className="text-xs font-semibold text-primary inline-flex items-center gap-1 pt-1">
                Open in Reader <ArrowRight className="w-3 h-3" />
              </span>
            </Card>

            <Card
              onClick={() =>
                onSelectArticle({
                  id: 'post-2',
                  title: 'Geopolitical Semiconductor Supply Chains and Sovereign Compute',
                  content:
                    'The global lithography landscape represents the most intricate single point of failure in modern industrial history.\n\nExtreme Ultraviolet (EUV) lithography systems produced by ASML depend on over 5,000 precision suppliers across Europe, Japan, and North America.',
                  category: 'Economics & Tech',
                  readTimeMinutes: 6,
                  takeaways: ['EUV lithography has 5000+ tier-1 suppliers.', 'Human capital is the primary constraint.'],
                })
              }
              className="p-5 bg-card border-border/70 hover:border-primary/40 rounded-2xl cursor-pointer shadow-sm hover:shadow-md transition-all space-y-2"
            >
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <Badge variant="secondary" className="text-[10px]">Economics & Tech</Badge>
                <span>Saved 4 days ago</span>
              </div>
              <h3 className="font-bold text-sm text-foreground">Geopolitical Semiconductor Supply Chains</h3>
              <p className="text-xs text-muted-foreground line-clamp-2">
                The global lithography landscape represents the most intricate single point of failure...
              </p>
              <span className="text-xs font-semibold text-primary inline-flex items-center gap-1 pt-1">
                Open in Reader <ArrowRight className="w-3 h-3" />
              </span>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'books' && (
        <div className="grid sm:grid-cols-3 gap-5">
          {books.map((book) => (
            <Card
              key={book.id}
              className="overflow-hidden bg-card border-border/70 hover:border-primary/40 rounded-2xl transition-all shadow-sm flex flex-col justify-between"
            >
              <div className="h-40 relative overflow-hidden bg-muted/40">
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                <Badge className="absolute top-3 right-3 text-[10px] bg-background/80 backdrop-blur-md text-foreground border-border/60">
                  {book.category}
                </Badge>
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-bold text-sm text-foreground line-clamp-1">{book.title}</h3>
                  <p className="text-xs text-muted-foreground">{book.author}</p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Progress: {book.progressPercent}%</span>
                    <span>{book.currentPage} / {book.totalPages} pages</span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${book.progressPercent}%` }}
                    />
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toast.success(`Opened ${book.title} at page ${book.currentPage}`)}
                  className="w-full text-xs font-semibold h-8"
                >
                  Continue Reading
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'collections' && (
        <div className="grid sm:grid-cols-3 gap-4">
          {collections.map((col) => (
            <Card
              key={col.id}
              className="p-5 bg-card border-border/70 hover:border-primary/40 rounded-2xl transition-all shadow-sm space-y-3 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <Library className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground">{col.name}</h3>
                <span className="text-xs text-muted-foreground">{col.bookCount} Core Materials</span>
              </div>
              <span className="text-xs font-semibold text-primary flex items-center gap-1 pt-2 border-t border-border/40">
                View Collection &rarr;
              </span>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'lists' && (
        <div className="grid sm:grid-cols-2 gap-4">
          {readingLists.map((rl) => (
            <Card
              key={rl.id}
              className="p-5 bg-card border-border/70 hover:border-primary/40 rounded-2xl transition-all shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-foreground">{rl.title}</h3>
                <Badge variant="outline" className="text-[10px]">{rl.itemCount} Items</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Curated study playlist for focused revision rounds.</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => toast.info(`Starting reading list: ${rl.title}`)}
                className="w-full text-xs font-semibold h-8"
              >
                Start Reading Sequence
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default LibraryView;
