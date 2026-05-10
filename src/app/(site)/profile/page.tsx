'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { GameWithCategories } from '@/lib/types/database';
import GameGrid from '@/components/games/GameGrid';
import GameCard from '@/components/games/GameCard';
import { formatDate } from '@/lib/utils';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Star } from 'lucide-react';
import toast from 'react-hot-toast';

interface RatedGame extends GameWithCategories {
  userScore: number;
}

type Tab = 'favorites' | 'history' | 'ratings';

export default function ProfilePage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [tab, setTab] = useState<Tab>('favorites');
  const [games, setGames] = useState<GameWithCategories[]>([]);
  const [ratedGames, setRatedGames] = useState<RatedGame[]>([]);
  const [gamesLoading, setGamesLoading] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading]);

  useEffect(() => {
    if (profile) setDisplayName(profile.display_name ?? profile.username ?? '');
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    setGamesLoading(true);
    async function load() {
      if (tab === 'favorites') {
        const { data } = await supabase
          .from('favorites')
          .select('game:games(*, categories:game_categories(category:categories(*)))')
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false });
        setGames(((data ?? []).map((d: Record<string, unknown>) => {
          const g = d.game as Record<string, unknown>;
          return { ...g, categories: ((g.categories as { category: unknown }[]) ?? []).map((gc) => gc.category) };
        })) as GameWithCategories[]);
      } else if (tab === 'history') {
        const { data } = await supabase
          .from('play_history')
          .select('game:games(*, categories:game_categories(category:categories(*)))')
          .eq('user_id', user!.id)
          .order('played_at', { ascending: false })
          .limit(24);
        setGames(((data ?? []).map((d: Record<string, unknown>) => {
          const g = d.game as Record<string, unknown>;
          return g ? { ...g, categories: ((g.categories as { category: unknown }[]) ?? []).map((gc) => gc.category) } : null;
        }).filter(Boolean)) as GameWithCategories[]);
      } else if (tab === 'ratings') {
        const { data } = await supabase
          .from('ratings')
          .select('score, game:games(*, categories:game_categories(category:categories(*)))')
          .eq('user_id', user!.id)
          .order('updated_at', { ascending: false });
        setRatedGames(((data ?? []).map((d: Record<string, unknown>) => {
          const g = d.game as Record<string, unknown>;
          return g ? { ...g, categories: ((g.categories as { category: unknown }[]) ?? []).map((gc) => gc.category), userScore: d.score } : null;
        }).filter(Boolean)) as RatedGame[]);
      }
      setGamesLoading(false);
    }
    load();
  }, [tab, user]);

  async function saveProfile() {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({ display_name: displayName }).eq('id', user.id);
    if (error) toast.error('Failed to save');
    else toast.success('Profile updated!');
    setSaving(false);
  }

  if (loading) return <div className="min-h-screen bg-[#0f1117] flex items-center justify-center text-gray-500">Loading...</div>;
  if (!user || !profile) return null;

  const TABS: { id: Tab; label: string }[] = [
    { id: 'favorites', label: 'Favorites' },
    { id: 'history', label: 'Recently Played' },
    { id: 'ratings', label: 'My Ratings' },
  ];

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Profile header */}
      <div className="flex items-start gap-6">
        <div className="w-20 h-20 rounded-2xl bg-indigo-600 flex items-center justify-center text-3xl font-bold text-white shrink-0">
          {(profile.display_name ?? profile.username ?? 'U')[0].toUpperCase()}
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white">{profile.display_name ?? profile.username}</h1>
          <p className="text-gray-500 text-sm">@{profile.username}</p>
          <p className="text-gray-600 text-xs">Member since {formatDate(profile.created_at)}</p>
        </div>
      </div>

      {/* Edit profile */}
      <div className="bg-[#1a1d2e] rounded-xl p-6 border border-white/10 space-y-4">
        <h2 className="font-semibold text-white">Edit Profile</h2>
        <div className="flex gap-3 max-w-md">
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Display name"
            className="flex-1"
          />
          <Button onClick={saveProfile} loading={saving} variant="secondary">Save</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/10 flex gap-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.id
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'ratings' ? (
        gamesLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-[#1a1d2e] rounded-xl aspect-video" />
            ))}
          </div>
        ) : ratedGames.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Star size={36} className="mx-auto mb-3 opacity-30" />
            <p>You haven't rated any games yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {ratedGames.map((game) => (
              <div key={game.id} className="relative">
                <GameCard game={game} />
                <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-black/70 backdrop-blur-sm rounded-full text-xs text-yellow-400 font-semibold">
                  <Star size={10} fill="currentColor" /> {game.userScore}/5
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <GameGrid games={games} loading={gamesLoading} />
      )}
    </main>
  );
}
