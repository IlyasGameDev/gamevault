'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import GameGrid from '@/components/games/GameGrid';
import { GameWithCategories } from '@/lib/types/database';

function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') ?? '';
  const [games, setGames] = useState<GameWithCategories[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q) { setGames([]); return; }
    setLoading(true);
    fetch(`/api/games?q=${encodeURIComponent(q)}&sort=popular`)
      .then((r) => r.json())
      .then(({ data }) => { setGames(data ?? []); setLoading(false); });
  }, [q]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Search size={24} className="text-gray-500" />
        <h1 className="text-2xl font-bold text-white">
          {q ? `Results for "${q}"` : 'Search Games'}
        </h1>
      </div>
      {!q ? (
        <p className="text-gray-500">Enter a search term to find games.</p>
      ) : (
        <GameGrid games={games} loading={loading} />
      )}
    </main>
  );
}

export default function SearchPage() {
  return <Suspense><SearchContent /></Suspense>;
}
