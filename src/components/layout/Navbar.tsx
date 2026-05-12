'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Bell, Menu, X, LogOut, User, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { name: 'Action', slug: 'action', icon: '⚔️' },
  { name: 'Puzzle', slug: 'puzzle', icon: '🧩' },
  { name: 'Racing', slug: 'racing', icon: '🏎️' },
  { name: 'Sports', slug: 'sports', icon: '⚽' },
  { name: 'Adventure', slug: 'adventure', icon: '🗺️' },
  { name: 'Shooting', slug: 'shooting', icon: '🎯' },
  { name: 'Arcade', slug: 'arcade', icon: '🕹️' },
  { name: 'Strategy', slug: 'strategy', icon: '♟️' },
];

export default function Navbar() {
  const { user, profile, signOut, isAdmin } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showUser, setShowUser] = useState(false);

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

  const initial = (profile?.display_name ?? profile?.username ?? user?.email ?? 'U')[0].toUpperCase();

  return (
    <header className="sticky top-0 z-40 bg-[#FFF8E6]/95 backdrop-blur-md border-b-[3px] border-[#0E1547]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
        {/* Mobile menu */}
        <button
          className="md:hidden w-11 h-11 grid place-items-center bg-white border-[3px] border-[#0E1547] rounded-xl shadow-chunk-sm"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="relative w-10 h-10 rounded-xl bg-[#6BD4F0] border-[3px] border-[#0E1547] grid place-items-center shadow-chunk-sm">
            <span className="font-extrabold text-[#0E1547] text-sm tracking-tighter">GV</span>
          </div>
          <div className="hidden sm:flex items-baseline font-extrabold text-xl text-[#0E1547] leading-none">
            <span>gamevault</span>
            <span className="text-[#FF5E9A]">.gg</span>
          </div>
        </Link>

        {/* Desktop search */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-2">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0E1547]" size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="search 2,400 games..."
              className="w-full pl-11 pr-4 py-2.5 bg-white border-[3px] border-[#0E1547] rounded-xl text-sm font-medium text-[#0E1547] placeholder:text-[#0E1547]/50 focus:outline-none focus:shadow-chunk-sm transition-shadow"
            />
          </div>
        </form>

        <div className="flex-1 md:hidden" />

        {/* Coin balance pill (only when logged in - decorative) */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-[#FCD635] border-[3px] border-[#0E1547] rounded-xl shadow-chunk-sm">
          <span className="w-5 h-5 rounded-full bg-[#0E1547] text-[#FCD635] grid place-items-center text-[10px] font-extrabold">$</span>
          <span className="font-extrabold text-[#0E1547] text-sm">51,500</span>
        </div>

        {/* Bell */}
        <button className="hidden sm:grid w-11 h-11 place-items-center bg-[#FF5E9A] border-[3px] border-[#0E1547] rounded-xl shadow-chunk-sm relative" aria-label="Notifications">
          <Bell size={18} className="text-white" strokeWidth={2.5} />
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#0E1547] border-2 border-[#FFF8E6]" />
        </button>

        {/* Auth */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUser((v) => !v)}
                className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 bg-white border-[3px] border-[#0E1547] rounded-xl shadow-chunk-sm"
              >
                <div className="w-7 h-7 rounded-lg bg-[#6BD4F0] border-2 border-[#0E1547] grid place-items-center text-xs font-extrabold text-[#0E1547]">
                  {initial}
                </div>
                <span className="hidden sm:block text-sm font-extrabold text-[#0E1547]">
                  {profile?.username ?? 'player'}
                </span>
              </button>
              {showUser && (
                <>
                  <button className="fixed inset-0 z-40 cursor-default" onClick={() => setShowUser(false)} aria-hidden />
                  <div className="absolute right-0 mt-2 w-52 bg-white border-[3px] border-[#0E1547] rounded-xl shadow-chunk py-1 z-50">
                    <Link href="/profile" onClick={() => setShowUser(false)} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-[#0E1547] hover:bg-[#FCD635]/30">
                      <User size={16} /> Profile
                    </Link>
                    {isAdmin && (
                      <Link href="/admin" onClick={() => setShowUser(false)} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-[#0E1547] hover:bg-[#FCD635]/30">
                        <Shield size={16} /> Admin
                      </Link>
                    )}
                    <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-4 py-2 text-sm font-bold text-[#FF3344] hover:bg-[#FF5E9A]/20">
                      <LogOut size={16} /> Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="hidden sm:inline-flex items-center px-3 py-2 text-sm font-extrabold text-[#0E1547]">
                Sign in
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center px-4 py-2 bg-[#0E1547] text-[#FFF8E6] text-sm font-extrabold rounded-xl border-[3px] border-[#0E1547] shadow-chunk-sm hover:-translate-y-0.5 active:translate-y-1 active:shadow-none transition-all"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t-[3px] border-[#0E1547] bg-[#FFF8E6] px-4 py-4 space-y-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="search games..."
              className="flex-1 px-4 py-2.5 bg-white border-[3px] border-[#0E1547] rounded-xl text-sm font-medium text-[#0E1547]"
            />
            <button type="submit" className="px-4 py-2.5 bg-[#0E1547] text-[#FFF8E6] rounded-xl text-sm font-extrabold border-[3px] border-[#0E1547]">
              Go
            </button>
          </form>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-extrabold text-[#0E1547] bg-white border-[3px] border-[#0E1547] rounded-xl"
              >
                <span>{cat.icon}</span>
                {cat.name}
              </Link>
            ))}
          </div>
          {!user && (
            <div className="flex gap-2">
              <Link href="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2 bg-white border-[3px] border-[#0E1547] rounded-xl text-sm font-extrabold text-[#0E1547]">
                Sign in
              </Link>
              <Link href="/register" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2 bg-[#0E1547] rounded-xl text-sm font-extrabold text-[#FFF8E6] border-[3px] border-[#0E1547]">
                Sign up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
