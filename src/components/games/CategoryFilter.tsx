'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import GameIcon from '@/components/ui/GameIcon';
import { Category } from '@/lib/types/database';

const CATEGORIES = [
  { name: 'All', slug: '', icon: 'discover' },
];

export default function CategoryFilter() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category') ?? '';
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    let cancelled = false;

    void Promise.resolve().then(async () => {
      const { data } = await fetch('/api/categories?active=published').then((res) => res.json());
      if (!cancelled) setCategories(data ?? []);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  function buildUrl(slug: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) params.set('category', slug);
    else params.delete('category');
    params.delete('page');
    return `${pathname}?${params.toString()}`;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {[...CATEGORIES, ...categories].map((cat) => (
        <Link
          key={cat.slug}
          href={buildUrl(cat.slug)}
          className={cn(
            'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
            activeCategory === cat.slug
              ? 'bg-[#6C5CFF] text-white'
              : 'border border-[#2A2A2A] bg-[#1A1A1A] text-[#A8A8A8] hover:bg-[#242424] hover:text-white'
          )}
        >
          <GameIcon type={cat.slug || cat.icon} size={14} className={activeCategory === cat.slug ? 'text-white' : undefined} />
          {cat.name}
        </Link>
      ))}
    </div>
  );
}
