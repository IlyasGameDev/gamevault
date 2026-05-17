'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Bell, Clock3, Heart, LogOut, Shield, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { Game } from '@/lib/types/database';
import toast from 'react-hot-toast';

export default function NavbarAuthMenu({
  placement,
  onNavigate,
}: {
  placement: 'desktop' | 'mobile';
  onNavigate?: () => void;
}) {
  const { user, profile, signOut, isAdmin } = useAuth();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [showUser, setShowUser] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [likedGames, setLikedGames] = useState<Game[]>([]);
  const [recentGames, setRecentGames] = useState<Game[]>([]);

  useEffect(() => {
    if (!user) {
      void Promise.resolve().then(() => {
        setLikedGames([]);
        setRecentGames([]);
      });
      return;
    }

    void Promise.resolve().then(async () => {
      const [favoritesResult, historyResult] = await Promise.all([
        fetch('/api/favorites').then((res) => res.ok ? res.json() : { data: [] }),
        supabase
          .from('play_history')
          .select('game:games(*)')
          .eq('user_id', user.id)
          .order('played_at', { ascending: false })
          .limit(8),
      ]);

      setLikedGames(
        ((favoritesResult.data ?? [])
          .map((item: { game?: Game | null }) => item.game)
          .filter(Boolean) as Game[])
          .slice(0, 4)
      );

      const seen = new Set<string>();
      setRecentGames(
        (((historyResult.data ?? []) as unknown as { game?: Game | null }[])
          .map((item: { game?: Game | null }) => item.game)
          .filter((game): game is Game => {
            if (!game || seen.has(game.id)) return false;
            seen.add(game.id);
            return true;
          }))
          .slice(0, 4)
      );
    });
  }, [supabase, user]);

  async function handleSignOut() {
    await signOut();
    toast.success('Signed out');
    onNavigate?.();
    router.push('/');
  }

  if (placement === 'mobile') {
    if (user) {
      return (
        <div className="flex gap-2">
          <Link href="/profile" onClick={onNavigate} className="flex-1 rounded-lg bg-[#1a1d2e] py-2 text-center text-sm text-gray-300">Profile</Link>
          <button onClick={handleSignOut} className="flex-1 rounded-lg bg-red-600/20 py-2 text-sm text-red-400">Sign out</button>
        </div>
      );
    }

    return (
      <div className="flex gap-2">
        <Link href="/login" onClick={onNavigate} className="flex-1 rounded-full bg-[#1A1A1A] py-2 text-center text-sm text-[#D8D8D8]">Sign in</Link>
        <Link href="/register" onClick={onNavigate} className="flex-1 rounded-full bg-[#6C5CFF] py-2 text-center text-sm font-bold text-white">Sign up</Link>
      </div>
    );
  }

  return (
    <>
      <div className="relative">
        <IconButton
          label="Notifications"
          onClick={() => {
            setShowLibrary(false);
            setShowUser(false);
            setShowNotifications((value) => !value);
          }}
        >
          <Bell size={23} strokeWidth={2.4} />
          <span className="absolute right-1.5 top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[#FF3F8E] px-1 text-[9px] font-black leading-none text-white">1</span>
        </IconButton>
        {showNotifications && <NotificationsPanel />}
      </div>

      <div className="relative">
        <IconButton
          label="Liked and recent games"
          onClick={() => {
            setShowNotifications(false);
            setShowUser(false);
            setShowLibrary((value) => !value);
          }}
        >
          <Heart size={24} strokeWidth={2.4} />
        </IconButton>
        {showLibrary && (
          <LibraryPanel
            likedGames={likedGames}
            recentGames={recentGames}
            signedIn={!!user}
          />
        )}
      </div>

      {user ? (
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(false);
              setShowLibrary(false);
              setShowUser((value) => !value);
            }}
            className="relative h-11 w-11 overflow-hidden rounded-full border-2 border-[#6C5CFF]/40 bg-[#25243A] transition-colors hover:border-[#9B8CFF]"
            aria-label="Open profile menu"
          >
            <Image
              src={profile?.avatar_url || '/maskot.png'}
              alt="Your YoPlayables profile avatar"
              fill
              className="object-cover"
              sizes="44px"
            />
          </button>
          {showUser && (
            <div className="absolute right-0 z-50 mt-3 w-48 rounded-2xl border border-[#2C2B42] bg-[#202033] py-1 shadow-2xl shadow-black/40">
              <Link href="/profile" onClick={() => setShowUser(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white">
                <User size={14} /> Profile
              </Link>
              {isAdmin && (
                <Link href="/admin" onClick={() => setShowUser(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white">
                  <Shield size={14} /> Admin
                </Link>
              )}
              <button onClick={handleSignOut} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-white/5 hover:text-red-300">
                <LogOut size={14} /> Sign out
              </button>
            </div>
          )}
        </div>
      ) : (
        <Link
          href="/login"
          className="relative h-11 w-11 overflow-hidden rounded-full border-2 border-[#6C5CFF]/40 bg-[#25243A] transition-colors hover:border-[#9B8CFF]"
          aria-label="Sign in"
        >
          <Image
            src="/maskot.png"
            alt="YoPlayables mascot"
            fill
            className="object-cover"
            sizes="44px"
          />
        </Link>
      )}
    </>
  );
}

function DropdownCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`absolute right-0 top-full z-50 mt-3 w-[340px] rounded-3xl border border-[#2C2B42] bg-[#202033] p-4 shadow-2xl shadow-black/45 ${className}`}>
      {children}
    </div>
  );
}

function NotificationsPanel() {
  return (
    <DropdownCard>
      <div className="flex items-center justify-between">
        <h2 className="text-base font-extrabold text-white">Notifications</h2>
        <span className="rounded-full bg-[#FF3F8E] px-2 py-0.5 text-xs font-black text-white">1</span>
      </div>
      <div className="mt-4 rounded-2xl bg-[#282743] p-3">
        <div className="flex gap-3">
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-2xl bg-[#6C5CFF]/20">
            <Image src="/maskot.png" alt="YoPlayables mascot" fill className="object-cover" sizes="44px" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">New games are ready</p>
            <p className="mt-1 text-xs leading-5 text-[#B7B5C8]">Fresh picks have been added to YoPlayables.</p>
          </div>
        </div>
      </div>
      <Link href="/new-games" className="mt-3 block rounded-2xl px-3 py-2 text-center text-sm font-bold text-[#9B8CFF] transition-colors hover:bg-[#6C5CFF]/10">
        View new games
      </Link>
    </DropdownCard>
  );
}

function LibraryPanel({
  likedGames,
  recentGames,
  signedIn,
}: {
  likedGames: Game[];
  recentGames: Game[];
  signedIn: boolean;
}) {
  return (
    <DropdownCard className="w-[380px]">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-extrabold text-white">Your games</h2>
        <Link href={signedIn ? '/profile' : '/login'} className="text-xs font-bold text-[#9B8CFF] hover:text-white">
          {signedIn ? 'View profile' : 'Sign in'}
        </Link>
      </div>

      <GameListSection title="Recently played" icon={<Clock3 size={15} />} games={recentGames} emptyText={signedIn ? 'No recent games yet.' : 'Sign in to track recent games.'} />
      <GameListSection title="Liked games" icon={<Heart size={15} />} games={likedGames} emptyText={signedIn ? 'No liked games yet.' : 'Sign in to save liked games.'} />
    </DropdownCard>
  );
}

function GameListSection({
  title,
  icon,
  games,
  emptyText,
}: {
  title: string;
  icon: ReactNode;
  games: Game[];
  emptyText: string;
}) {
  return (
    <section className="mt-4">
      <h3 className="mb-2 flex items-center gap-2 text-xs font-black uppercase text-[#B7B5C8]">
        <span className="text-[#9B8CFF]">{icon}</span>
        {title}
      </h3>
      {games.length > 0 ? (
        <div className="space-y-2">
          {games.map((game) => (
            <Link key={game.id} href={`/games/${game.slug}`} className="flex items-center gap-3 rounded-2xl p-2 transition-colors hover:bg-white/10">
              <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-xl bg-[#151522]">
                {game.thumbnail_url ? (
                  <Image
                    src={game.thumbnail_url}
                    alt={game.title}
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="64px"
                  />
                ) : (
                  <Image src="/maskot.png" alt="YoPlayables mascot" fill className="object-cover" sizes="64px" />
                )}
              </div>
              <p className="min-w-0 truncate text-sm font-bold text-white">{game.title}</p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="rounded-2xl bg-[#282743] px-3 py-3 text-sm text-[#B7B5C8]">{emptyText}</p>
      )}
    </section>
  );
}

function IconButton({
  label,
  children,
  onClick,
}: {
  label: string;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex h-11 w-11 items-center justify-center rounded-full bg-[#2A2940] text-[#F4F3FF] transition-colors hover:bg-[#34334F]"
      aria-label={label}
    >
      {children}
    </button>
  );
}
