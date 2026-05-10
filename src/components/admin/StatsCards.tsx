import { Gamepad2, Users, Play, MessageSquare, AlertTriangle } from 'lucide-react';
import { AdminStats } from '@/lib/types/database';
import { formatNumber } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';

interface StatsCardsProps {
  stats: AdminStats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      label: 'Total Games',
      value: stats.total_games,
      sub: `${stats.published_games} published · ${stats.draft_games} draft`,
      icon: Gamepad2,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
    },
    {
      label: 'Total Users',
      value: stats.total_users,
      icon: Users,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Total Plays',
      value: stats.total_plays,
      icon: Play,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Comments',
      value: stats.total_comments,
      sub: stats.flagged_comments > 0 ? `${stats.flagged_comments} flagged` : undefined,
      icon: stats.flagged_comments > 0 ? AlertTriangle : MessageSquare,
      color: stats.flagged_comments > 0 ? 'text-yellow-400' : 'text-purple-400',
      bg: stats.flagged_comments > 0 ? 'bg-yellow-500/10' : 'bg-purple-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardContent className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${card.bg}`}>
              <card.icon size={22} className={card.color} />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{formatNumber(card.value)}</p>
              <p className="text-xs text-gray-500">{card.label}</p>
              {card.sub && <p className="text-xs text-gray-600 mt-0.5">{card.sub}</p>}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
