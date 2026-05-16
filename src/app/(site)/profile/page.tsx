'use client';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { GameWithCategories } from '@/lib/types/database';
import GameGrid from '@/components/games/GameGrid';
import GameCard from '@/components/games/GameCard';
import { formatDate } from '@/lib/utils';
import { MAX_AVATAR_SIZE_MB } from '@/lib/constants';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Star, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

interface RatedGame extends GameWithCategories {
  userScore: number;
}

type Tab = 'favorites' | 'history' | 'ratings';

export default function ProfilePage() {
  const { user, profile, loading, refreshProfile } = useAuthContext();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [tab, setTab] = useState<Tab>('favorites');
  const [games, setGames] = useState<GameWithCategories[]>([]);
  const [ratedGames, setRatedGames] = useState<RatedGame[]>([]);
  const [gamesLoading, setGamesLoading] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [loading, router, user]);

  useEffect(() => {
    if (profile) {
      void Promise.resolve().then(() => {
        setDisplayName(profile.display_name ?? profile.username ?? '');
        setAvatarUrl(profile.avatar_url ?? '');
      });
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    void Promise.resolve().then(() => setGamesLoading(true));
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
  }, [supabase, tab, user]);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > MAX_AVATAR_SIZE_MB * 1024 * 1024) {
      toast.error(`Avatar must be under ${MAX_AVATAR_SIZE_MB}MB`);
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('File must be an image');
      return;
    }

    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/profile/avatar', {
        method: 'POST',
        body: formData,
      });
      const payload = (await response.json()) as { data?: { avatarUrl?: string }; error?: string };

      if (!response.ok || !payload.data?.avatarUrl) {
        throw new Error(payload.error ?? 'Failed to upload avatar');
      }

      setAvatarUrl(payload.data.avatarUrl);
      await refreshProfile();
      toast.success('Avatar updated!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to upload avatar');
    } finally {
      setAvatarUploading(false);
      e.target.value = '';
    }
  }

  async function saveProfile() {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName.trim() })
      .eq('id', user.id);
    if (error) toast.error('Failed to save');
    else {
      await refreshProfile();
      toast.success('Profile updated!');
    }
    setSaving(false);
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>
  );
  if (!user || !profile) return null;

  const initials = (profile.display_name ?? profile.username ?? 'U')[0].toUpperCase();

  const TABS: { id: Tab; label: string }[] = [
    { id: 'favorites', label: 'Favorites' },
    { id: 'history', label: 'Recently Played' },
    { id: 'ratings', label: 'My Ratings' },
  ];

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6">
      {/* Profile header */}
      <div className="flex items-start gap-6">
        {/* Avatar with upload overlay */}
        <div className="relative shrink-0 group">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-[#6C5CFF] text-3xl font-bold text-white">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="Avatar"
                width={80}
                height={80}
                className="object-cover w-full h-full"
              />
            ) : (
              initials
            )}
          </div>
          <button
            onClick={() => avatarInputRef.current?.click()}
            disabled={avatarUploading}
            className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            title="Change avatar"
          >
            {avatarUploading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Camera size={20} className="text-white" />
            )}
          </button>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-white">{profile.display_name ?? profile.username}</h1>
          <p className="text-sm text-[#A8A8A8]">@{profile.username}</p>
          <p className="text-xs text-[#777]">Member since {formatDate(profile.created_at)}</p>
        </div>
      </div>

      {/* Edit profile */}
      <div className="space-y-4 rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-6">
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
        <p className="text-xs text-[#777]">Click your avatar above to change it (max 2MB, images only)</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/10 flex gap-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.id
                ? 'border-[#6C5CFF] text-white'
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
              <div key={i} className="aspect-video animate-pulse rounded-2xl bg-[#1A1A1A]" />
            ))}
          </div>
        ) : ratedGames.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Star size={36} className="mx-auto mb-3 opacity-30" />
            <p>You haven&apos;t rated any games yet</p>
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
