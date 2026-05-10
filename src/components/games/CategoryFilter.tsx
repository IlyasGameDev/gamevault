'use client';
import Link from 'next/link';
import { useSearchParams, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { name: 'All', slug: '' },
  { name: 'Action', slug: 'action', icon: '⚔️' },
  { name: 'Puzzle', slug: 'puzzle', icon: '🧩' },
  { name: 'Racing', slug: 'racing', icon: '🏎️' },
  { name: 'Sports', slug: 'sports', icon: '⚽' },
  { name: 'Adventure', slug: 'adventure', icon: '🗺️' },
  { name: 'Shooting', slug: 'shooting', icon: '🎯' },
  { name: 'Arcade', slug: 'arcade', icon: '🕹️' },
  { name: 'Strategy', slug: 'strategy', icon: '♟️' },
  { name: 'Multiplayer', slug: 'multiplayer', icon: '👥' },
];

export default function CategoryFilter() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category') ?? '';

  function buildUrl(slug: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) params.set('category', slug);
    else params.delete('category');
    params.delete('page');
    return `${pathname}?${params.toString()}`;
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {CATEGORIES.map((cat) => (
        <Link
          key={cat.slug}
          href={buildUrl(cat.slug)}
          className={cn(
            'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
            activeCategory === cat.slug
              ? 'bg-indigo-600 text-white'
              : 'bg-[#1a1d2e] text-gray-400 hover:text-white hover:bg-[#252840]'
          )}
        >
          {cat.icon && <span className="mr-1">{cat.icon}</span>}
          {cat.name}
        </Link>
      ))}
    </div>
  );
}
