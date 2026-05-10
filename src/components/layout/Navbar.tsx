'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Gamepad2, User, LogOut, Settings, Shield, Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useDebounce } from '@/hooks/useDebounce';
import { SITE_NAME } from '@/lib/constants';
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
  const [showSearch, setShowSearch] = useState(false);
  const [showCats, setShowCats] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/search?q=${encodeURIComponent(search.trim())}`);
      setShowSearch(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    toast.success('Signed out');
    router.push('/');
  }

  return (
    <nav className="sticky top-0 z-40 border-b border-white/10 bg-[#0f1117]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white shrink-0">
          <Gamepad2 className="text-indigo-500" size={24} />
          <span className="hidden sm:block">{SITE_NAME}</span>
        </Link>

        {/* Desktop search */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search games..."
              className="w-full pl-9 pr-4 py-2 bg-[#1a1d2e] border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </form>

        {/* Categories dropdown */}
        <div className="hidden md:block relative">
          <button
            onMouseEnter={() => setShowCats(true)}
            onMouseLeave={() => setShowCats(false)}
            className="text-sm text-gray-400 hover:text-white transition-colors px-2 py-1"
          >
            Browse ▾
          </button>
          {showCats && (
            <div
              onMouseEnter={() => setShowCats(true)}
              onMouseLeave={() => setShowCats(false)}
              className="absolute top-full left-0 mt-1 w-64 bg-[#1a1d2e] border border-white/10 rounded-xl shadow-2xl grid grid-cols-2 gap-1 p-2 z-50"
            >
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/categories/${cat.slug}`}
                  onClick={() => setShowCats(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  <span>{cat.icon}</span>{cat.name}
                </Link>
              ))}
              <Link
                href="/categories"
                onClick={() => setShowCats(false)}
                className="col-span-2 text-center px-3 py-2 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                All categories →
              </Link>
            </div>
          )}
        </div>

        <div className="flex-1" />

        {/* Auth */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUser((v) => !v)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1a1d2e] border border-white/10 text-sm text-gray-300 hover:text-white transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                  {(profile?.display_name ?? profile?.username ?? 'U')[0].toUpperCase()}
                </div>
                {profile?.display_name ?? profile?.username}
              </button>
              {showUser && (
                <div className="absolute right-0 mt-2 w-48 bg-[#1a1d2e] border border-white/10 rounded-xl shadow-2xl py-1 z-50">
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
            <>
              <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5">
                Sign in
              </Link>
              <Link href="/register" className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition-colors">
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden text-gray-400 hover:text-white"
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#0f1117] px-4 py-4 space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search games..."
              className="flex-1 px-4 py-2 bg-[#1a1d2e] border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500"
            />
            <button type="submit" className="px-4 py-2 bg-indigo-600 rounded-lg text-white text-sm">Go</button>
          </form>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((cat) => (
              <Link key={cat.slug} href={`/categories/${cat.slug}`} onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 bg-[#1a1d2e] rounded-lg">
                {cat.icon} {cat.name}
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
                <Link href="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2 bg-[#1a1d2e] rounded-lg text-sm text-gray-300">Sign in</Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2 bg-indigo-600 rounded-lg text-sm text-white">Sign up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
