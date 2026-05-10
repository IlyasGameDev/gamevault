import { supabaseAdmin } from '@/lib/supabase/admin';
import StatsCards from '@/components/admin/StatsCards';
import RecentGamesTable from '@/components/admin/RecentGamesTable';
import Link from 'next/link';
import { Plus, ExternalLink } from 'lucide-react';
import { AdminStats, Game } from '@/lib/types/database';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';

export const dynamic = 'force-dynamic';

async function getStats(): Promise<AdminStats> {
  const [gamesRes, usersRes, playsRes, commentsRes] = await Promise.all([
    supabaseAdmin.from('games').select('status'),
    supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('play_history').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('comments').select('is_flagged'),
  ]);

  const games = gamesRes.data ?? [];
  return {
    total_games: games.length,
    published_games: games.filter((g) => g.status === 'published').length,
    draft_games: games.filter((g) => g.status === 'draft').length,
    archived_games: games.filter((g) => g.status === 'archived').length,
    total_users: usersRes.count ?? 0,
    total_plays: playsRes.count ?? 0,
    total_comments: (commentsRes.data ?? []).length,
    flagged_comments: (commentsRes.data ?? []).filter((c) => c.is_flagged).length,
  };
}

async function getRecentGames(): Promise<Game[]> {
  const { data } = await supabaseAdmin
    .from('games')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);
  return data ?? [];
}

export default async function AdminDashboard() {
  const [stats, recentGames] = await Promise.all([getStats(), getRecentGames()]);

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Overview of your platform</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/games/new"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">
            <Plus size={16} /> Add Game
          </Link>
          <Link href="/" target="_blank"
            className="flex items-center gap-2 px-4 py-2 bg-[#1a1d2e] border border-white/10 text-gray-300 hover:text-white text-sm rounded-lg transition-colors">
            <ExternalLink size={16} /> View Site
          </Link>
        </div>
      </div>

      <StatsCards stats={stats} />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white">Recent Games</h2>
            <Link href="/admin/games" className="text-sm text-indigo-400 hover:text-indigo-300">View all →</Link>
          </div>
        </CardHeader>
        <CardContent>
          <RecentGamesTable games={recentGames} />
        </CardContent>
      </Card>
    </div>
  );
}
