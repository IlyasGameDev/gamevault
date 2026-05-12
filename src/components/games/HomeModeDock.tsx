'use client';
import Link from 'next/link';
import { Users, Globe, BookOpen } from 'lucide-react';

interface ModeButton {
  label: string;
  sub: string;
  href: string;
  icon: React.ReactNode;
  bg: string;
  shadow: string;
  text: string;
}

const MODES: ModeButton[] = [
  {
    label: 'PVP',
    sub: 'Multiplayer',
    href: '/categories/multiplayer',
    icon: <Users size={28} fill="currentColor" />,
    bg: 'bg-emerald-400',
    shadow: 'shadow-[0_6px_0_0_#047857]',
    text: 'text-emerald-900',
  },
  {
    label: 'Quests',
    sub: 'Adventure',
    href: '/categories/adventure',
    icon: <BookOpen size={28} fill="currentColor" />,
    bg: 'bg-amber-400',
    shadow: 'shadow-[0_6px_0_0_#b45309]',
    text: 'text-amber-900',
  },
  {
    label: 'Explore',
    sub: 'All Games',
    href: '/games',
    icon: <Globe size={28} fill="currentColor" />,
    bg: 'bg-pink-400',
    shadow: 'shadow-[0_6px_0_0_#be185d]',
    text: 'text-pink-900',
  },
];

export default function HomeModeDock() {
  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4">
      {MODES.map((m) => (
        <Link
          key={m.label}
          href={m.href}
          className={`flex flex-col items-center justify-center gap-1 py-4 sm:py-5
                      ${m.bg} ${m.shadow} ${m.text}
                      rounded-3xl border-[3px] border-white font-extrabold text-center
                      hover:-translate-y-0.5 active:translate-y-1.5 active:shadow-none
                      transition-all duration-150`}
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/40 rounded-2xl flex items-center justify-center">
            {m.icon}
          </div>
          <span className="text-sm sm:text-base font-extrabold mt-1">{m.label}</span>
          <span className="text-[10px] sm:text-xs opacity-70 -mt-1">{m.sub}</span>
        </Link>
      ))}
    </div>
  );
}
