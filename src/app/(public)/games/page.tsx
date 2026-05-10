'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import GameGrid from '@/components/games/GameGrid';
import CategoryFilter from '@/components/games/CategoryFilter';
import Pagination from '@/components/ui/Pagination';
import { Search } from 'lucide-react';
import { GameWithCategories } from '@/lib/types/database';
import { useDebounce } from '@/hooks/useDebounce';
import { SORT_OPTIONS } from '@/lib/constants';

function BrowseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const page = parseInt(searchParams.get('page') ?? '1');
  const sort = searchParams.get('sort') ?? 'newest';
  const category = searchParams.get('category') ?? '';
  const q = searchParams.get('q') ?? '';

  const [search, setSearch] = useState(q);
  const debouncedSearch = useDebounce(search, 400);

  const [games, setGames] = useState<GameWithCategories[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (debouncedSearch !== q) {
      const params = new URLSearchParams(searchParams.toString());
      if (debouncedSearch) params.set('q', debouncedSearch);
      else params.delete('q');
      params.delete('page');
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: page.toString(), sort });
    if (q) params.set('q', q);
    if (category) params.set('category', category);

    fetch(`/api/games?${params}`)
      .then((r) => r.json())
      .then(({ data, count }) => {
        setGames(data ?? []);
        setTotal(count ?? 0);
        setHasMore((count ?? 0) > page * 24);
        setLoading(false);
      });
  }, [page, sort, category, q]);

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Browse Games{total > 0 && <span className="text-gray-500 font-normal text-base ml-2">({total} games)</span>}</h1>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="pl-9 pr-4 py-2 bg-[#1a1d2e] border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 w-48"
            />
          </div>
          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setParam('sort', e.target.value)}
            className="px-3 py-2 bg-[#1a1d2e] border border-white/10 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-indigo-500"
          >
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <CategoryFilter />
      <GameGrid games={games} loading={loading} />

      <Pagination
        page={page}
        hasMore={hasMore}
        onPrev={() => setParam('page', String(page - 1))}
        onNext={() => setParam('page', String(page + 1))}
      />
    </main>
  );
}

export default function GamesPage() {
  return <Suspense><BrowseContent /></Suspense>;
}
