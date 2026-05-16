'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Edit2, Trash2, Search, CheckSquare, Square, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Game } from '@/lib/types/database';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { formatDate, formatNumber } from '@/lib/utils';
import toast from 'react-hot-toast';

const ADMIN_LIMIT = 100;

const statusVariant: Record<string, 'success' | 'warning' | 'default'> = {
  published: 'success', draft: 'warning', archived: 'default',
};

export default function AdminGamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [heroFilter, setHeroFilter] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchGames = useCallback(async (p: number) => {
    setLoading(true);
    const params = new URLSearchParams({ limit: String(ADMIN_LIMIT), page: String(p) });
    params.set('status', statusFilter || 'all');
    if (search) params.set('q', search);
    const { data, count } = await fetch(`/api/games?${params}`).then((r) => r.json());
    setGames((data ?? []) as Game[]);
    setTotal(count ?? 0);
    setSelected(new Set());
    setLoading(false);
  }, [search, statusFilter]);

  useEffect(() => {
    void Promise.resolve().then(() => {
      setPage(1);
      fetchGames(1);
    });
  }, [fetchGames]);

  const visibleGames = games.filter((game) => {
    if (typeFilter && game.game_type !== typeFilter) return false;
    if (heroFilter === 'hero' && !game.is_featured) return false;
    if (heroFilter === 'not-hero' && game.is_featured) return false;
    return true;
  });
  const totalPages = Math.ceil(total / ADMIN_LIMIT);
  const heroCount = games.filter((game) => game.is_featured).length;

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => prev.size === visibleGames.length ? new Set() : new Set(visibleGames.map((g) => g.id)));
  }

  async function bulkAction(action: 'publish' | 'archive' | 'delete' | 'feature' | 'unfeature') {
    if (!selected.size) return;
    const ids = [...selected];
    if (action === 'delete' && !confirm(`Delete ${ids.length} game(s)? This cannot be undone.`)) return;

    setBulkLoading(true);
    try {
      if (action === 'delete') {
        await Promise.all(ids.map((id) => fetch(`/api/games/${id}`, { method: 'DELETE' })));
        setGames((g) => g.filter((game) => !selected.has(game.id)));
        setTotal((t) => t - ids.length);
        toast.success(`Deleted ${ids.length} game(s)`);
      } else if (action === 'feature' || action === 'unfeature') {
        const is_featured = action === 'feature';
        await Promise.all(ids.map((id) =>
          fetch(`/api/games/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_featured }),
          })
        ));
        setGames((g) => g.map((game) => selected.has(game.id) ? { ...game, is_featured } : game));
        toast.success(`${ids.length} game(s) ${is_featured ? 'added to' : 'removed from'} the hero`);
      } else {
        const status = action === 'publish' ? 'published' : 'archived';
        await Promise.all(ids.map((id) =>
          fetch(`/api/games/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
          })
        ));
        setGames((g) => g.map((game) => selected.has(game.id) ? { ...game, status } : game));
        toast.success(`${ids.length} game(s) ${status}`);
      }
      setSelected(new Set());
    } catch {
      toast.error('Bulk action failed');
    } finally {
      setBulkLoading(false);
    }
  }

  async function toggleHero(game: Game) {
    const is_featured = !game.is_featured;
    setGames((current) => current.map((item) =>
      item.id === game.id ? { ...item, is_featured } : item
    ));

    try {
      const res = await fetch(`/api/games/${game.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_featured }),
      });
      if (!res.ok) throw new Error('Failed to update hero selection');
      toast.success(
        is_featured
          ? game.status === 'published'
            ? 'Added to homepage hero'
            : 'Added to hero. Publish it to show on the homepage.'
          : 'Removed from homepage hero'
      );
    } catch {
      setGames((current) => current.map((item) =>
        item.id === game.id ? { ...item, is_featured: game.is_featured } : item
      ));
      toast.error('Failed to update hero selection');
    }
  }

  async function deleteGame(id: string, title: string) {
    if (!confirm(`Delete "${title}"?`)) return;
    const res = await fetch(`/api/games/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setGames((g) => g.filter((game) => game.id !== id));
      setTotal((t) => t - 1);
      toast.success('Game deleted');
    } else {
      toast.error('Failed to delete');
    }
  }

  function goToPage(p: number) {
    setPage(p);
    fetchGames(p);
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Games</h1>
          {total > 0 && <p className="text-sm text-gray-500 mt-0.5">{total.toLocaleString()} total</p>}
          <p className="mt-1 text-xs text-gray-500">
            Hero section: {heroCount} selected. The newest 5 selected published games appear on the homepage.
          </p>
        </div>
        <Link href="/admin/games/new"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">
          <Plus size={16} /> Add Game
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search games..."
            className="pl-9 pr-4 py-2 bg-[#1a1d2e] border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 w-52"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-[#1a1d2e] border border-white/10 rounded-lg text-sm text-gray-300 focus:outline-none">
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 bg-[#1a1d2e] border border-white/10 rounded-lg text-sm text-gray-300 focus:outline-none">
          <option value="">All types</option>
          <option value="iframe">iframe</option>
          <option value="hosted">hosted</option>
        </select>
        <select value={heroFilter} onChange={(e) => setHeroFilter(e.target.value)}
          className="px-3 py-2 bg-[#1a1d2e] border border-white/10 rounded-lg text-sm text-gray-300 focus:outline-none">
          <option value="">All hero states</option>
          <option value="hero">In hero</option>
          <option value="not-hero">Not in hero</option>
        </select>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-indigo-600/10 border border-indigo-500/30 rounded-xl">
          <span className="text-sm text-indigo-300 font-medium">{selected.size} selected</span>
          <div className="flex gap-2 ml-2">
            <Button size="sm" variant="secondary" loading={bulkLoading} onClick={() => bulkAction('publish')}>Publish</Button>
            <Button size="sm" variant="secondary" loading={bulkLoading} onClick={() => bulkAction('feature')}>Add to hero</Button>
            <Button size="sm" variant="secondary" loading={bulkLoading} onClick={() => bulkAction('unfeature')}>Remove from hero</Button>
            <Button size="sm" variant="secondary" loading={bulkLoading} onClick={() => bulkAction('archive')}>Archive</Button>
            <Button size="sm" variant="danger" loading={bulkLoading} onClick={() => bulkAction('delete')}>Delete</Button>
          </div>
          <button onClick={() => setSelected(new Set())} className="ml-auto text-xs text-gray-500 hover:text-white">Clear</button>
        </div>
      )}

      <div className="bg-[#1a1d2e] rounded-xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : visibleGames.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No games found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/10">
                <tr className="text-left">
                  <th className="px-4 py-4 w-10">
                    <button onClick={toggleAll} className="text-gray-500 hover:text-white">
                      {selected.size === visibleGames.length && visibleGames.length > 0
                        ? <CheckSquare size={16} className="text-indigo-400" />
                        : <Square size={16} />}
                    </button>
                  </th>
                  <th className="px-4 py-4 text-gray-500 font-medium">Game</th>
                  <th className="px-4 py-4 text-gray-500 font-medium">Type</th>
                  <th className="px-4 py-4 text-gray-500 font-medium">Status</th>
                  <th className="px-4 py-4 text-gray-500 font-medium">Hero</th>
                  <th className="px-4 py-4 text-gray-500 font-medium">Plays</th>
                  <th className="px-4 py-4 text-gray-500 font-medium">Created</th>
                  <th className="px-4 py-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {visibleGames.map((game) => (
                  <tr key={game.id} className={`hover:bg-white/5 transition-colors ${selected.has(game.id) ? 'bg-indigo-500/5' : ''}`}>
                    <td className="px-4 py-4">
                      <button onClick={() => toggleSelect(game.id)} className="text-gray-500 hover:text-white">
                        {selected.has(game.id)
                          ? <CheckSquare size={16} className="text-indigo-400" />
                          : <Square size={16} />}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-8 rounded bg-white/5 overflow-hidden shrink-0">
                          {game.thumbnail_url && <Image src={game.thumbnail_url} alt={game.title} fill unoptimized className="object-cover" />}
                        </div>
                        <div>
                          <p className="font-medium text-white truncate max-w-[180px]">{game.title}</p>
                          <p className="text-xs text-gray-600">{game.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={game.game_type === 'iframe' ? 'blue' : 'purple'}>{game.game_type}</Badge>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={statusVariant[game.status] ?? 'default'}>{game.status}</Badge>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => toggleHero(game)}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                          game.is_featured
                            ? 'border-[#6C5CFF]/50 bg-[#6C5CFF]/15 text-[#9B8CFF] hover:bg-[#6C5CFF]/25'
                            : 'border-white/10 text-gray-500 hover:border-white/30 hover:text-white'
                        }`}
                        title={game.is_featured ? 'Remove from homepage hero' : 'Add to homepage hero'}
                      >
                        <Star size={12} className={game.is_featured ? 'fill-current' : ''} />
                        {game.is_featured ? 'Hero' : 'Add'}
                      </button>
                    </td>
                    <td className="px-4 py-4 text-gray-400">{formatNumber(game.play_count)}</td>
                    <td className="px-4 py-4 text-gray-600">{formatDate(game.created_at)}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <Link href={`/admin/games/${game.id}/edit`}
                          className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                          <Edit2 size={14} />
                        </Link>
                        <button onClick={() => deleteGame(game.id, game.title)}
                          className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">
            Page {page} of {totalPages} ({total.toLocaleString()} games)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page === 1 || loading}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#1a1d2e] border border-white/10 rounded-lg text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <button
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages || loading}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#1a1d2e] border border-white/10 rounded-lg text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
