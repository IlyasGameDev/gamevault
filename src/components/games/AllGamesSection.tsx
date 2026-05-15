'use client';
import { useState, useEffect, useRef } from 'react';
import GameGrid from './GameGrid';
import { GameWithCategories } from '@/lib/types/database';

export default function AllGamesSection() {
  const [games, setGames] = useState<GameWithCategories[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef(1);
  const fetchingRef = useRef(false);

  async function fetchGames(p: number, append = false) {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    if (p === 1) setLoading(true); else setLoadingMore(true);
    try {
      const { data, count } = await fetch(`/api/games?page=${p}&sort=newest`).then((r) => r.json());
      const newGames = data ?? [];
      setGames((prev) => {
        if (!append) return newGames;
        const seen = new Set(prev.map((game) => game.id));
        return [...prev, ...newGames.filter((game: GameWithCategories) => !seen.has(game.id))];
      });
      setHasMore((count ?? 0) > p * 24);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      fetchingRef.current = false;
    }
  }

  useEffect(() => {
    void Promise.resolve().then(() => fetchGames(1));
  }, []);

  useEffect(() => {
    if (!hasMore || loading || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const next = pageRef.current + 1;
          pageRef.current = next;
          fetchGames(next, true);
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
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#6C5CFF] border-t-transparent" />
        </div>
      )}
      <div ref={sentinelRef} className="h-1" />
    </div>
  );
}
