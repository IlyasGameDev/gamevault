'use client';
import { useState, useEffect, useRef } from 'react';
import HomeGameCard from './HomeGameCard';
import { GameWithCategories } from '@/lib/types/database';

export default function HomeAllGamesSection() {
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

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="aspect-[4/3] rounded-3xl bg-white/30 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!games.length) {
    return (
      <div className="text-center py-16 bg-white/15 rounded-3xl">
        <span className="text-5xl mb-4 block">🎮</span>
        <p className="text-white font-bold">No games yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {games.map((game) => (
          <HomeGameCard key={game.id} game={game} />
        ))}
      </div>
      {loadingMore && (
        <div className="flex justify-center py-6">
          <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <div ref={sentinelRef} className="h-1" />
    </div>
  );
}
