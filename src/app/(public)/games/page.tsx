'use client';
import { useState, useEffect, useRef, Suspense, useCallback } from 'react';
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
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef(1);
  const fetchingRef = useRef(false);

  // Sync search input → URL
  useEffect(() => {
    if (debouncedSearch === q) return;
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearch) params.set('q', debouncedSearch);
    else params.delete('q');
    params.delete('page');
    router.replace(`${pathname}?${params.toString()}`);
  }, [debouncedSearch, pathname, q, router, searchParams]);

  const fetchPage = useCallback(async (nextPage: number, append = false) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    if (append) setLoadingMore(true);
    else setLoading(true);
    const params = new URLSearchParams({ page: String(nextPage), sort });
    if (q) params.set('q', q);
    if (category) params.set('category', category);
    try {
      const { data, count } = await fetch(`/api/games?${params}`).then((r) => r.json());
      setGames((current) => {
        const nextGames = data ?? [];
        if (!append) return nextGames;
        const seen = new Set(current.map((game) => game.id));
        return [...current, ...nextGames.filter((game: GameWithCategories) => !seen.has(game.id))];
      });
      setTotal(count ?? 0);
      setHasMore((count ?? 0) > nextPage * 24);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      fetchingRef.current = false;
    }
  }, [category, q, sort]);

  // Reset + fetch page 1 when filters change
  useEffect(() => {
    pageRef.current = 1;
    void Promise.resolve().then(() => {
      setGames([]);
      fetchPage(1);
    });
  }, [fetchPage]);

  // Infinite scroll — load next page when sentinel is visible
  useEffect(() => {
    if (!hasMore || loading || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        const next = pageRef.current + 1;
        pageRef.current = next;
        fetchPage(next, true);
      },
      { rootMargin: '400px' }
    );

    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [fetchPage, hasMore, loading, loadingMore]);

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-extrabold text-white">
          Browse Games
          {total > 0 && <span className="ml-2 text-base font-normal text-[#A8A8A8]">({total.toLocaleString()} games)</span>}
        </h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8A8A8]" size={14} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-48 rounded-full border border-[#2A2A2A] bg-[#1A1A1A] py-2 pl-9 pr-4 text-sm text-white outline-none placeholder:text-[#777] focus:border-[#6C5CFF]"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setParam('sort', e.target.value)}
            className="rounded-full border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 text-sm text-gray-300 outline-none focus:border-[#6C5CFF]"
          >
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <CategoryFilter />
      <GameGrid games={games} loading={loading} />

      {loadingMore && (
        <div className="flex justify-center py-6">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#6C5CFF] border-t-transparent" />
        </div>
      )}
      <div ref={sentinelRef} className="h-1" />
    </main>
  );
}

export default function GamesPage() {
  return <Suspense><BrowseContent /></Suspense>;
}
