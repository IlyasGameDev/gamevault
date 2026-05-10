'use client';
import { useState, useEffect } from 'react';
import GameGrid from './GameGrid';
import Button from '@/components/ui/Button';
import { GameWithCategories } from '@/lib/types/database';
import { ChevronDown } from 'lucide-react';

export default function AllGamesSection() {
  const [games, setGames] = useState<GameWithCategories[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

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

  function loadMore() {
    const next = page + 1;
    setPage(next);
    fetchGames(next, true);
  }

  return (
    <div className="space-y-6">
      <GameGrid games={games} loading={loading} cols={5} />
      {hasMore && (
        <div className="flex justify-center">
          <Button variant="secondary" size="lg" loading={loadingMore} onClick={loadMore}>
            <ChevronDown size={18} /> Load More Games
          </Button>
        </div>
      )}
    </div>
  );
}
