'use client';
import { useState, useEffect } from 'react';
import { Category } from '@/lib/types/database';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Download, ChevronLeft, ChevronRight, Loader2, CheckSquare, Square } from 'lucide-react';

interface FeedGame {
  id: string;
  title: string;
  description: string;
  instructions: string;
  url: string;
  category: string;
  tags: string;
  thumb: string;
  width: string;
  height: string;
  isDuplicate: boolean;
}

interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

export default function ImportClient({ categories }: { categories: Category[] }) {
  const [page, setPage] = useState(1);
  const [games, setGames] = useState<FeedGame[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'draft' | 'published'>('published');
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPage() {
      setLoading(true);
      setResult(null);
      try {
        const res = await fetch(`/api/import/preview?page=${page}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        if (cancelled) return;

        const newGames: FeedGame[] = json.data;
        setGames(newGames);
        setSelected(new Set(newGames.filter((g) => !g.isDuplicate).map((g) => g.url)));

        // Auto-map categories that match by name
        setCategoryMap((prev) => {
          const next = { ...prev };
          for (const g of newGames) {
            if (!next[g.category]) {
              const match = categories.find(
                (c) =>
                  c.name.toLowerCase() === g.category.toLowerCase() ||
                  c.slug === g.category.toLowerCase()
              );
              if (match) next[g.category] = match.id;
            }
          }
          return next;
        });
      } catch (err) {
        if (!cancelled) toast.error(err instanceof Error ? err.message : 'Failed to load feed');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPage();
    return () => { cancelled = true; };
  }, [page, categories]);

  const feedCategories = [...new Set(games.map((g) => g.category))].sort();
  const selectableGames = games.filter((g) => !g.isDuplicate);
  const selectedCount = selectableGames.filter((g) => selected.has(g.url)).length;
  const allSelected = selectableGames.length > 0 && selectableGames.every((g) => selected.has(g.url));

  function toggleGame(url: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(url)) next.delete(url); else next.add(url);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        selectableGames.forEach((g) => next.delete(g.url));
      } else {
        selectableGames.forEach((g) => next.add(g.url));
      }
      return next;
    });
  }

  async function handleImport() {
    const gamesToImport = games.filter((g) => selected.has(g.url) && !g.isDuplicate);
    if (!gamesToImport.length) { toast.error('No games selected'); return; }

    const unmapped = [...new Set(gamesToImport.map((g) => g.category))].filter((c) => !categoryMap[c]);
    if (unmapped.length) { toast.error(`Map categories first: ${unmapped.join(', ')}`); return; }

    setImporting(true);
    try {
      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ games: gamesToImport, categoryMap, status }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setResult(json);
      toast.success(`Imported ${json.imported} game${json.imported !== 1 ? 's' : ''}!`);
      // Mark imported games as duplicates locally
      const importedUrls = new Set(gamesToImport.map((g) => g.url));
      setGames((prev) => prev.map((g) => importedUrls.has(g.url) ? { ...g, isDuplicate: true } : g));
      setSelected(new Set());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Category mapping */}
      <div className="bg-[#0d0f1a] border border-white/10 rounded-xl p-5 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-white">Category Mapping</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Map each GameMonetize category to one of your site&apos;s categories. Unmapped categories will be skipped.
          </p>
        </div>
        {feedCategories.length === 0 ? (
          <p className="text-gray-600 text-sm">Load a page to see categories.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {feedCategories.map((cat) => (
              <div key={cat} className="flex items-center gap-3">
                <span className="text-sm text-gray-300 w-28 shrink-0">{cat}</span>
                <span className="text-gray-600 text-xs">→</span>
                <select
                  className="flex-1 bg-[#1a1d2e] border border-white/10 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
                  value={categoryMap[cat] ?? ''}
                  onChange={(e) => setCategoryMap((prev) => ({ ...prev, [cat]: e.target.value }))}
                >
                  <option value="">— skip —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Import as:</span>
          <select
            className="bg-[#1a1d2e] border border-white/10 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
            value={status}
            onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
          >
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
        <button
          onClick={handleImport}
          disabled={importing || selectedCount === 0}
          className="ml-auto flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          {importing ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          Import {selectedCount} game{selectedCount !== 1 ? 's' : ''}
        </button>
      </div>

      {/* Result banner */}
      {result && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-sm space-y-2">
          <p className="text-green-400 font-medium">
            ✓ Imported {result.imported} game{result.imported !== 1 ? 's' : ''}, skipped {result.skipped}
          </p>
          {result.errors.length > 0 && (
            <ul className="space-y-1">
              {result.errors.map((e, i) => (
                <li key={i} className="text-red-400 text-xs">{e}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Feed table */}
      <div className="bg-[#0d0f1a] border border-white/10 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
          <button
            onClick={toggleAll}
            disabled={selectableGames.length === 0}
            className="text-xs text-gray-400 hover:text-white transition-colors disabled:opacity-30"
          >
            {allSelected ? 'Deselect all' : 'Select all'}
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="p-1 text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-gray-400 tabular-nums">Page {page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={loading || games.length === 0}
              className="p-1 text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-indigo-400" />
          </div>
        ) : games.length === 0 ? (
          <div className="py-16 text-center text-gray-600 text-sm">No games on this page.</div>
        ) : (
          <div className="divide-y divide-white/5">
            {games.map((game) => (
              <div
                key={game.url}
                className={cn(
                  'flex items-start gap-4 px-5 py-4 transition-colors',
                  game.isDuplicate
                    ? 'opacity-40 cursor-not-allowed'
                    : selected.has(game.url)
                    ? 'bg-indigo-600/5 cursor-pointer hover:bg-indigo-600/10'
                    : 'cursor-pointer hover:bg-white/[0.02]'
                )}
                onClick={() => !game.isDuplicate && toggleGame(game.url)}
              >
                <div className="mt-0.5 shrink-0 text-indigo-400">
                  {game.isDuplicate ? (
                    <Square size={18} className="text-gray-700" />
                  ) : selected.has(game.url) ? (
                    <CheckSquare size={18} />
                  ) : (
                    <Square size={18} className="text-gray-600" />
                  )}
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={game.thumb}
                  alt=""
                  className="w-20 h-14 object-cover rounded-lg shrink-0 bg-gray-900"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-white truncate">{game.title}</p>
                    {game.isDuplicate && (
                      <span className="text-xs text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded shrink-0">
                        Already imported
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{game.description}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs text-indigo-400 font-medium">{game.category}</span>
                    <span className="text-xs text-gray-600">{game.width}×{game.height}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
