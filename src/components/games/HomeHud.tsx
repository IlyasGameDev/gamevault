'use client';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Bell, Plus, Gamepad2, Trophy } from 'lucide-react';

export default function HomeHud({ totalGames }: { totalGames: number }) {
  const { user, profile } = useAuth();
  const initial = (profile?.display_name ?? profile?.username ?? 'G')[0].toUpperCase();

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {/* Profile pill */}
      <Link
        href={user ? '/profile' : '/login'}
        className="flex items-center gap-2 bg-white pr-3 pl-1 py-1 rounded-full border-2 border-white
                   shadow-[0_3px_0_0_rgba(43,89,195,0.6)]
                   hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all duration-150"
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-sm font-extrabold border-2 border-white">
          {initial}
        </div>
        <span className="text-sm font-extrabold text-slate-800 max-w-[80px] truncate hidden sm:block">
          {user ? (profile?.display_name ?? profile?.username ?? 'Player') : 'Sign in'}
        </span>
      </Link>

      {/* Games-played counter pill */}
      <div className="flex items-center gap-1.5 bg-yellow-400 px-3 py-2 rounded-full border-2 border-white shadow-[0_3px_0_0_#b45309]">
        <Gamepad2 size={16} className="text-yellow-900" />
        <span className="text-sm font-extrabold text-yellow-900 tabular-nums">{totalGames.toLocaleString()}</span>
        <button className="ml-1 w-5 h-5 rounded-full bg-sky-400 border border-white flex items-center justify-center text-white shadow-[0_2px_0_0_#0369a1]">
          <Plus size={12} strokeWidth={3} />
        </button>
      </div>

      {/* Trophy stat pill (hidden on small) */}
      <div className="hidden sm:flex items-center gap-1.5 bg-pink-400 px-3 py-2 rounded-full border-2 border-white shadow-[0_3px_0_0_#be185d]">
        <Trophy size={16} className="text-pink-900" fill="currentColor" />
        <span className="text-sm font-extrabold text-pink-900 tabular-nums">0</span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Notification bell */}
      <button
        className="relative w-11 h-11 bg-white rounded-full border-2 border-white shadow-[0_3px_0_0_rgba(43,89,195,0.6)]
                   hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all duration-150
                   flex items-center justify-center"
      >
        <Bell size={18} className="text-blue-600" fill="currentColor" />
        <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
      </button>
    </div>
  );
}
