'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Gamepad2, Play } from 'lucide-react';
import { GameWithCategories } from '@/lib/types/database';

interface FeaturedCarouselProps {
  games: GameWithCategories[];
}

export default function FeaturedCarousel({ games }: FeaturedCarouselProps) {
  const featuredGames = games.slice(0, 5);
  const mainGame = featuredGames[0];

  if (!mainGame) return null;

  return (
    <section className="grid gap-3 lg:grid-cols-[1.45fr_1fr]">
      <GameTile game={mainGame} priority size="large" />

      <div className="grid grid-cols-2 gap-3">
        {featuredGames.slice(1, 5).map((game) => (
          <GameTile key={game.id} game={game} />
        ))}
      </div>
    </section>
  );
}

function GameTile({
  game,
  priority,
  size = 'small',
}: {
  game: GameWithCategories;
  priority?: boolean;
  size?: 'large' | 'small';
}) {
  const isLarge = size === 'large';

  return (
    <Link
      href={`/games/${game.slug}`}
      className={`group relative overflow-hidden rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] shadow-xl shadow-black/20 ${
        isLarge ? 'min-h-[280px] sm:min-h-[360px] lg:min-h-[430px]' : 'min-h-[135px] sm:min-h-[205px]'
      }`}
    >
      {game.thumbnail_url || game.cover_url ? (
        <Image
          src={game.cover_url ?? game.thumbnail_url!}
          alt={game.title}
          fill
          priority={priority}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes={isLarge ? '(max-width: 1024px) 100vw, 60vw' : '(max-width: 1024px) 50vw, 20vw'}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-[#202020]">
          <Gamepad2 size={isLarge ? 56 : 34} className="text-[#A8A8A8]" />
        </div>
      )}

      <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />

      <div className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-bold text-white">
        {game.categories[0]?.name ?? 'Game'}
      </div>

      <div className="absolute inset-x-0 bottom-0 bg-black/75 p-3 sm:p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            {isLarge && <p className="mb-1 text-xs font-bold uppercase text-[#9B8CFF]">Featured</p>}
            <h1 className={`${isLarge ? 'text-2xl sm:text-3xl' : 'text-sm sm:text-base'} truncate font-extrabold text-white`}>
              {game.title}
            </h1>
          </div>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#6C5CFF] text-white opacity-0 transition-opacity group-hover:opacity-100">
            <Play size={17} fill="white" />
          </span>
        </div>
      </div>
    </Link>
  );
}
