import Link from 'next/link';
import Image from 'next/image';
import { Edit2 } from 'lucide-react';
import { Game } from '@/lib/types/database';
import Badge from '@/components/ui/Badge';
import { formatDate, formatNumber } from '@/lib/utils';

interface RecentGamesTableProps {
  games: Game[];
}

const statusVariant: Record<string, 'success' | 'warning' | 'default'> = {
  published: 'success',
  draft: 'warning',
  archived: 'default',
};

export default function RecentGamesTable({ games }: RecentGamesTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 text-left">
            <th className="pb-3 text-gray-500 font-medium">Game</th>
            <th className="pb-3 text-gray-500 font-medium">Type</th>
            <th className="pb-3 text-gray-500 font-medium">Status</th>
            <th className="pb-3 text-gray-500 font-medium">Plays</th>
            <th className="pb-3 text-gray-500 font-medium">Rating</th>
            <th className="pb-3 text-gray-500 font-medium">Created</th>
            <th className="pb-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {games.map((game) => (
            <tr key={game.id} className="hover:bg-white/5 transition-colors">
              <td className="py-3 pr-4">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-7 rounded overflow-hidden bg-white/5 shrink-0">
                    {game.thumbnail_url && (
                      <Image src={game.thumbnail_url} alt={game.title} fill className="object-cover" />
                    )}
                  </div>
                  <span className="font-medium text-white truncate max-w-[160px]">{game.title}</span>
                </div>
              </td>
              <td className="py-3 pr-4">
                <Badge variant={game.game_type === 'iframe' ? 'blue' : 'purple'}>{game.game_type}</Badge>
              </td>
              <td className="py-3 pr-4">
                <Badge variant={statusVariant[game.status] ?? 'default'}>{game.status}</Badge>
              </td>
              <td className="py-3 pr-4 text-gray-400">{formatNumber(game.play_count)}</td>
              <td className="py-3 pr-4 text-gray-400">
                {game.rating_count > 0 ? `${game.rating_avg.toFixed(1)} ★` : '—'}
              </td>
              <td className="py-3 pr-4 text-gray-600">{formatDate(game.created_at)}</td>
              <td className="py-3">
                <Link href={`/admin/games/${game.id}/edit`}
                  className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors inline-flex">
                  <Edit2 size={14} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
