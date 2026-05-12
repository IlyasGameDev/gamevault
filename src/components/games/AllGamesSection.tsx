'use client';
import { useState, useEffect, useRef } from 'react';
import GameGrid from './GameGrid';
import { GameWithCategories } from '@/lib/types/database';

export default function AllGamesSection() {
  const [games, setGames] = useState<GameWithCategories[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  async function fetchGames(p: number, append = false) {
    if (p === 1) setLoading(true); else setLoadingMore(true);
    try {
      const { data, count } = await fetch(`/api/games?page=${p}&sort=newest`).then((r) => r.json());
      const newGames = data ?? [];
      setGames((prev) => append ? [...prev, ...newGames] : newGames);
      setHasMore((count ?? 0) > p * 24);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  useEffect(() => { fetchGames(1); }, []);

  useEffect(() => {
    if (!hasMore || loading || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage((prev) => {
            const next = prev + 1;
            fetchGames(next, true);
            return next;
          });
        }
      },
      { rootMargin: '400px' }
    );

    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore]);

  return (
    <div className="space-y-6">
      <GameGrid games={games} loading={loading} cols={5} />
      {loadingMore && (
        <div className="flex justify-center py-6">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <div ref={sentinelRef} className="h-1" />
    </div>
  );
}
