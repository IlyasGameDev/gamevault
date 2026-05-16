'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import GameGrid from './GameGrid';
import { GameWithCategories } from '@/lib/types/database';

export default function AllGamesSection() {
  const [games, setGames] = useState<GameWithCategories[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef(1);
  const fetchingRef = useRef(false);

  const fetchGames = useCallback(async (p: number, append = false) => {
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
  }, []);

  useEffect(() => {
    if (!sectionRef.current) return;

    if (!('IntersectionObserver' in window)) {
      void Promise.resolve().then(() => setEnabled(true));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setEnabled(true);
          observer.disconnect();
        }
      },
      { rootMargin: '900px' }
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!enabled || games.length > 0) return;
    void Promise.resolve().then(() => fetchGames(1));
  }, [enabled, fetchGames, games.length]);

  useEffect(() => {
    if (!enabled || !hasMore || loading || loadingMore) return;

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
  }, [enabled, fetchGames, hasMore, loading, loadingMore]);

  return (
    <div ref={sectionRef} className="space-y-6">
      {enabled ? <GameGrid games={games} loading={loading} cols={5} /> : <div className="h-1" aria-hidden="true" />}
      {loadingMore && (
        <div className="flex justify-center py-6">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#6C5CFF] border-t-transparent" />
        </div>
      )}
      <div ref={sentinelRef} className="h-1" />
    </div>
  );
}
