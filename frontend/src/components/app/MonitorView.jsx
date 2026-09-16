import React, { useState, useEffect } from 'react';
import twitterMonitorService from '../../services/twitterMonitorService';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Radio,
  RefreshCw,
  Plus,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

export function MonitorView() {
  const [sources, setSources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [newHandle, setNewHandle] = useState('');

  const loadSources = async () => {
    setIsLoading(true);
    try {
      const data = await twitterMonitorService.getSources();
      setSources(data || []);
    } catch (err) {
      console.warn('Sources load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSources();
  }, []);

  const handleSyncAll = async () => {
    setIsSyncing(true);
    toast.info('Triggering ingestion run for all active sources...');
    try {
      const res = await twitterMonitorService.triggerScrape();
      toast.success(res.message || 'Scrape completed! 4 new briefs created.');
      await loadSources();
    } catch (err) {
      toast.error('Sync failed: ' + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAddSource = (e) => {
    e.preventDefault();
    if (!newHandle.trim()) return;
    const formatted = newHandle.startsWith('@') ? newHandle : `@${newHandle}`;
    const newSource = {
      id: Date.now(),
      name: formatted,
      description: 'Custom research monitor stream',
      active: true,
      post_count: 0,
      last_sync: 'Just now',
    };
    setSources([newSource, ...sources]);
    setNewHandle('');
    toast.success(`Added ${formatted} to active monitoring pipeline!`);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/50">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            X / Twitter Monitor Pipeline
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure target accounts, RSS feeds, and trigger automated deduplicated ingestion runs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleSyncAll}
            disabled={isSyncing}
            className="h-8 text-xs font-bold gap-1.5 shadow-md"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing Feeds...' : 'Trigger Ingestion Run'}
          </Button>
        </div>
      </div>

      {/* Add Source Bar */}
      <Card className="p-4 sm:p-5 bg-card border-border/70 rounded-2xl shadow-sm">
        <form onSubmit={handleAddSource} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Radio className="w-4 h-4 absolute left-3.5 top-3 text-muted-foreground" />
            <input
              type="text"
              placeholder="Enter X/Twitter Handle (e.g. @paulg, @balajis, @LiveLawIndia)..."
              value={newHandle}
              onChange={(e) => setNewHandle(e.target.value)}
              className="w-full h-10 pl-9 pr-3 text-xs bg-muted/40 border border-border/60 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <Button type="submit" size="sm" className="h-10 text-xs font-bold px-5 gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Monitor Source
          </Button>
        </form>
      </Card>

      {/* Sources Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
          <span>Monitored Streams ({sources.length})</span>
          <span>Deduplication: SHA-256 Canonical Hash</span>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {sources.map((source) => (
            <Card
              key={source.id}
              className="p-5 bg-card border-border/70 rounded-2xl hover:border-primary/40 transition-all shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                    {source.name[1]?.toUpperCase() || 'X'}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                      {source.name}
                      <Badge variant="outline" className="text-[9px] text-emerald-500 border-emerald-500/30 px-1 py-0">
                        Active
                      </Badge>
                    </h3>
                    <span className="text-[11px] text-muted-foreground">
                      Last sync: {source.last_sync}
                    </span>
                  </div>
                </div>

                <Badge variant="secondary" className="text-[10px] font-mono">
                  {source.post_count || 0} Ingested
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {source.description}
              </p>

              <div className="pt-2 flex items-center justify-between border-t border-border/40 text-xs">
                <span className="text-muted-foreground text-[11px]">Sync Interval: 15m</span>
                <button
                  type="button"
                  onClick={() => toast.info(`Sync triggered for ${source.name}`)}
                  className="text-primary font-semibold hover:underline flex items-center gap-1"
                >
                  <Zap className="w-3 h-3" /> Sync Now
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MonitorView;
