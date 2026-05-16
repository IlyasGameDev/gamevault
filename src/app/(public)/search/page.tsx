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
    void Promise.resolve().then(() => {
      if (!q) { setGames([]); return; }
      setLoading(true);
      fetch(`/api/games?q=${encodeURIComponent(q)}&sort=popular`)
        .then((r) => r.json())
        .then(({ data }) => { setGames(data ?? []); setLoading(false); });
    });
  }, [q]);

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <section className="space-y-4 rounded-3xl border border-[#252525] bg-[#161616] px-5 py-6 sm:px-7 sm:py-7">
        <div className="flex items-center gap-3">
          <Search size={24} className="text-[#6C5CFF]" />
          <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
            {q ? `Search Results for "${q}"` : 'Search Games'}
          </h1>
        </div>
        {q ? (
          <>
            <p className="max-w-4xl text-base leading-7 text-[#D8D8D8]">
              Browse game results related to {q} on YoPlayables. This search page helps you quickly find matching browser games, categories, and tags so you can jump straight into the titles that fit what you want to play.
            </p>
            <p className="max-w-4xl text-base leading-7 text-[#B9B9C8]">
              If the current results are too broad, try a more specific search term such as a genre, gameplay style, or game theme to narrow things down.
            </p>
          </>
        ) : (
          <>
            <p className="max-w-4xl text-base leading-7 text-[#D8D8D8]">
              Search the YoPlayables library to find free browser games by title, category, or theme. It is the fastest way to jump from a general idea to a game you can start instantly.
            </p>
            <p className="max-w-4xl text-base leading-7 text-[#B9B9C8]">
              Try terms like action, puzzle, racing, soccer, multiplayer, or stickman to discover relevant games without scrolling through the full catalog.
            </p>
          </>
        )}
      </section>
      {!q ? (
        <p className="text-[#A8A8A8]">Enter a search term to find games.</p>
      ) : (
        <GameGrid games={games} loading={loading} />
      )}
    </main>
  );
}

export default function SearchPage() {
  return <Suspense><SearchContent /></Suspense>;
}
