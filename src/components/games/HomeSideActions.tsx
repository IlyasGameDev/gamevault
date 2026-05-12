'use client';
import Link from 'next/link';
import { Gift, Wallet, Trophy, Sparkles } from 'lucide-react';

interface ActionButton {
  label: string;
  href: string;
  icon: React.ReactNode;
  bg: string;
  shadow: string;
  text: string;
  badge?: boolean;
}

const ACTIONS: ActionButton[] = [
  {
    label: 'Bonus',
    href: '/games?sort=newest',
    icon: <Sparkles size={22} fill="currentColor" />,
    bg: 'bg-emerald-400',
    shadow: 'shadow-[0_4px_0_0_#047857]',
    text: 'text-emerald-900',
    badge: true,
  },
  {
    label: 'Gifts',
    href: '/games?sort=popular',
    icon: <Gift size={22} fill="currentColor" />,
    bg: 'bg-pink-400',
    shadow: 'shadow-[0_4px_0_0_#be185d]',
    text: 'text-pink-900',
    badge: true,
  },
  {
    label: 'Top',
    href: '/games?sort=rated',
    icon: <Wallet size={22} fill="currentColor" />,
    bg: 'bg-yellow-400',
    shadow: 'shadow-[0_4px_0_0_#b45309]',
    text: 'text-yellow-900',
  },
  {
    label: 'Rank',
    href: '/categories',
    icon: <Trophy size={22} fill="currentColor" />,
    bg: 'bg-purple-400',
    shadow: 'shadow-[0_4px_0_0_#6b21a8]',
    text: 'text-purple-900',
  },
];

export default function HomeSideActions({ side = 'left' }: { side?: 'left' | 'right' }) {
  // On mobile: horizontal row at top of hero
  // On desktop: floating column on the side
  return (
    <div
      className={`flex md:flex-col gap-2 sm:gap-3 ${side === 'right' ? 'md:items-end' : 'md:items-start'}`}
    >
      {(side === 'right' ? ACTIONS.slice().reverse() : ACTIONS).map((a) => (
        <Link
          key={a.label}
          href={a.href}
          className={`relative flex flex-col items-center justify-center gap-0.5 w-14 h-14 sm:w-16 sm:h-16
                      ${a.bg} ${a.shadow} ${a.text}
                      rounded-2xl border-[3px] border-white font-extrabold
                      hover:-translate-y-0.5 active:translate-y-1 active:shadow-none
                      transition-all duration-150`}
        >
          {a.icon}
          <span className="text-[10px] uppercase tracking-tight">{a.label}</span>
          {a.badge && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
          )}
        </Link>
      ))}
    </div>
  );
}
