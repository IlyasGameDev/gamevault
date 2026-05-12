'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import GameGrid from '@/components/games/GameGrid';
import CategoryFilter from '@/components/games/CategoryFilter';
import { Search } from 'lucide-react';
import { GameWithCategories } from '@/lib/types/database';
import { useDebounce } from '@/hooks/useDebounce';
import { SORT_OPTIONS } from '@/lib/constants';

function BrowseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const sort = searchParams.get('sort') ?? 'newest';
  const category = searchParams.get('category') ?? '';
  const q = searchParams.get('q') ?? '';

  const [search, setSearch] = useState(q);
  const debouncedSearch = useDebounce(search, 400);

  const [games, setGames] = useState<GameWithCategories[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Sync search input → URL
  useEffect(() => {
    if (debouncedSearch === q) return;
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearch) params.set('q', debouncedSearch);
    else params.delete('q');
    params.delete('page');
    router.replace(`${pathname}?${params.toString()}`);
  }, [debouncedSearch]); // eslint-disable-line

  // Reset + fetch page 1 when filters change
  useEffect(() => {
    setPage(1);
    setGames([]);
    setLoading(true);
    const params = new URLSearchParams({ page: '1', sort });
    if (q) params.set('q', q);
    if (category) params.set('category', category);
    fetch(`/api/games?${params}`)
      .then((r) => r.json())
      .then(({ data, count }) => {
        setGames(data ?? []);
        setTotal(count ?? 0);
        setHasMore((count ?? 0) > 24);
        setLoading(false);
      });
  }, [sort, category, q]); // eslint-disable-line

  // Infinite scroll — load next page when sentinel is visible
  useEffect(() => {
    if (!hasMore || loading || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        setPage((prev) => {
          const next = prev + 1;
          setLoadingMore(true);
          const params = new URLSearchParams({ page: String(next), sort });
          if (q) params.set('q', q);
          if (category) params.set('category', category);
          fetch(`/api/games?${params}`)
            .then((r) => r.json())
            .then(({ data, count }) => {
              setGames((g) => [...g, ...(data ?? [])]);
              setHasMore((count ?? 0) > next * 24);
              setLoadingMore(false);
            });
          return next;
        });
      },
      { rootMargin: '400px' }
    );

    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, sort, category, q]); // eslint-disable-line

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
        <h1 className="text-2xl font-bold text-white">
          Browse Games
          {total > 0 && <span className="text-gray-500 font-normal text-base ml-2">({total.toLocaleString()} games)</span>}
        </h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="pl-9 pr-4 py-2 bg-[#1a1d2e] border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 w-48"
            />
          </div>
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

      {loadingMore && (
        <div className="flex justify-center py-6">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <div ref={sentinelRef} className="h-1" />
    </main>
  );
}

export default function GamesPage() {
  return <Suspense><BrowseContent /></Suspense>;
}
