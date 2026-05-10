'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { Game } from '@/lib/types/database';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { formatDate, formatNumber } from '@/lib/utils';
import toast from 'react-hot-toast';

const statusVariant: Record<string, 'success' | 'warning' | 'default'> = {
  published: 'success', draft: 'warning', archived: 'default',
};

export default function AdminGamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const params = new URLSearchParams({ status: statusFilter || 'all', q: search });
    fetch(`/api/games?${params}`)
      .then((r) => r.json())
      .then(({ data }) => { setGames(data ?? []); setLoading(false); });
  }, [search, statusFilter]);

  async function deleteGame(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/games/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setGames((g) => g.filter((game) => game.id !== id));
      toast.success('Game deleted');
    } else {
      toast.error('Failed to delete game');
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Games</h1>
        <Link href="/admin/games/new"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">
          <Plus size={16} /> Add Game
        </Link>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search games..."
            className="w-full pl-9 pr-4 py-2 bg-[#1a1d2e] border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-[#1a1d2e] border border-white/10 rounded-lg text-sm text-gray-300 focus:outline-none"
        >
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="bg-[#1a1d2e] rounded-xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : games.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No games found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/10">
                <tr className="text-left">
                  <th className="px-6 py-4 text-gray-500 font-medium">Game</th>
                  <th className="px-6 py-4 text-gray-500 font-medium">Type</th>
                  <th className="px-6 py-4 text-gray-500 font-medium">Status</th>
                  <th className="px-6 py-4 text-gray-500 font-medium">Plays</th>
                  <th className="px-6 py-4 text-gray-500 font-medium">Created</th>
                  <th className="px-6 py-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {games.map((game) => (
                  <tr key={game.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-8 rounded bg-white/5 overflow-hidden shrink-0">
                          {game.thumbnail_url && <Image src={game.thumbnail_url} alt={game.title} fill className="object-cover" />}
                        </div>
                        <div>
                          <p className="font-medium text-white truncate max-w-[200px]">{game.title}</p>
                          <p className="text-xs text-gray-600">{game.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={game.game_type === 'iframe' ? 'blue' : 'purple'}>{game.game_type}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={statusVariant[game.status] ?? 'default'}>{game.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{formatNumber(game.play_count)}</td>
                    <td className="px-6 py-4 text-gray-600">{formatDate(game.created_at)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
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
    </div>
  );
}
