'use client';
import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Bell, Clock3, Heart, LogOut, Menu, Search, Shield, User, X } from 'lucide-react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { Category, Game } from '@/lib/types/database';
import toast from 'react-hot-toast';

export default function Navbar({
  categories = [],
  sidebarExpanded = false,
  onToggleSidebar,
}: {
  categories?: Category[];
  sidebarExpanded?: boolean;
  onToggleSidebar?: () => void;
}) {
  const { user, profile, signOut, isAdmin } = useAuthContext();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [search, setSearch] = useState('');
  const [showUser, setShowUser] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [likedGames, setLikedGames] = useState<Game[]>([]);
  const [recentGames, setRecentGames] = useState<Game[]>([]);
  const sidebarId = 'category-sidebar';

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/search?q=${encodeURIComponent(search.trim())}`);
      setMobileOpen(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    toast.success('Signed out');
    router.push('/');
  }

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

  function closeDesktopPanels() {
    setShowNotifications(false);
    setShowLibrary(false);
    setShowUser(false);
  }

  return (
    <nav className="sticky top-0 z-40 border-b border-[#252439] bg-[#171722]/95 backdrop-blur-md">
      <div className="mx-auto flex h-[60px] max-w-[1540px] items-center gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3 md:basis-0">
          <div className="relative hidden w-[46px] shrink-0 md:-ml-6 md:flex">
            <button
              type="button"
              onClick={() => {
                closeDesktopPanels();
                onToggleSidebar?.();
              }}
              className={`flex h-[60px] w-[46px] items-center justify-center transition-colors hover:bg-white/10 ${
                sidebarExpanded ? 'bg-white/10 text-[#9B8CFF]' : 'text-white'
              }`}
              aria-label={sidebarExpanded ? 'Collapse categories' : 'Expand categories'}
              aria-controls={sidebarId}
              aria-expanded={sidebarExpanded}
            >
              <Menu size={24} strokeWidth={2.4} />
            </button>
          </div>

          <Link href="/" className="relative h-10 w-[135px] shrink-0 sm:w-[155px]" aria-label="YoPlayables home">
            <Image
              src="/yoplayables-logo.png"
              alt="YoPlayables"
              fill
              className="object-contain object-left"
              sizes="(max-width: 640px) 135px, 155px"
            />
          </Link>
        </div>

        <form onSubmit={handleSearch} className="hidden flex-[1.45] justify-center md:flex">
          <div className="relative w-full max-w-[630px]">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search games and categories"
              className="h-11 w-full rounded-full border border-transparent bg-[#3A3955] pl-6 pr-13 text-base font-semibold text-white outline-none transition-colors placeholder:text-[#B7B5C8] focus:border-[#6C5CFF] focus:bg-[#424061]"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[#C7C5D8] transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Search"
            >
              <Search size={22} strokeWidth={2.3} />
            </button>
          </div>
        </form>

        <div className="hidden flex-1 items-center justify-end gap-3 md:flex md:basis-0">
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
                  setShowUser((v) => !v);
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
                  <Link href="/profile" onClick={() => setShowUser(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5">
                    <User size={14} /> Profile
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" onClick={() => setShowUser(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5">
                      <Shield size={14} /> Admin
                    </Link>
                  )}
                  <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-white/5">
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
        </div>

        <button
          className="ml-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[#25243A] text-[#D8D8E8] hover:text-white md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="space-y-4 border-t border-[#2A2A2A] bg-[#0F0F0F] px-4 py-4 md:hidden">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8A8A8]" size={16} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search games..."
                className="w-full rounded-full border border-[#2A2A2A] bg-[#1A1A1A] py-2 pl-9 pr-4 text-sm text-white outline-none placeholder:text-[#777] focus:border-[#6C5CFF]"
              />
            </div>
            <button type="submit" className="rounded-full bg-[#6C5CFF] px-4 py-2 text-sm font-bold text-white">Go</button>
          </form>
          <div className="grid grid-cols-2 gap-2">
            <Link href="/new-games" onClick={() => setMobileOpen(false)} className="rounded-xl bg-[#1A1A1A] px-3 py-2 text-sm text-[#D8D8D8]">New Games</Link>
            <Link href="/popular-games" onClick={() => setMobileOpen(false)} className="rounded-xl bg-[#1A1A1A] px-3 py-2 text-sm text-[#D8D8D8]">Popular</Link>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((cat) => (
              <Link key={cat.slug} href={`/categories/${cat.slug}`} onClick={() => setMobileOpen(false)}
                className="rounded-xl bg-[#1A1A1A] px-3 py-2 text-sm text-[#D8D8D8]">
                {cat.name}
              </Link>
            ))}
          </div>
          <div className="flex gap-2">
            {user ? (
              <>
                <Link href="/profile" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2 bg-[#1a1d2e] rounded-lg text-sm text-gray-300">Profile</Link>
                <button onClick={handleSignOut} className="flex-1 py-2 bg-red-600/20 rounded-lg text-sm text-red-400">Sign out</button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)} className="flex-1 rounded-full bg-[#1A1A1A] py-2 text-center text-sm text-[#D8D8D8]">Sign in</Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="flex-1 rounded-full bg-[#6C5CFF] py-2 text-center text-sm font-bold text-white">Sign up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
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
