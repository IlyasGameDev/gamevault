'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Play, Trophy } from 'lucide-react';
import { GameWithCategories } from '@/lib/types/database';

export default function HomeFeaturedCarousel({ games }: { games: GameWithCategories[] }) {
  const [index, setIndex] = useState(0);
  const current = games[index];

  useEffect(() => {
    if (games.length <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % games.length), 5000);
    return () => clearInterval(t);
  }, [games.length]);

  if (!current) return null;

  return (
    <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] md:aspect-[3/1] rounded-3xl overflow-hidden border-4 border-white shadow-[0_8px_0_0_rgba(43,89,195,0.6)] group">
      {current.cover_url || current.thumbnail_url ? (
        <Image
          src={current.cover_url ?? current.thumbnail_url!}
          alt={current.title}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-purple-500 to-blue-500" />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/85 via-blue-900/50 to-transparent" />

      <div className="absolute inset-0 flex items-center">
        <div className="px-6 sm:px-10 md:px-16 max-w-2xl space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400 rounded-full shadow-[0_3px_0_0_#b8860b]">
            <Trophy size={14} className="text-yellow-900" fill="currentColor" />
            <span className="text-xs font-extrabold text-yellow-900 uppercase tracking-wide">Featured</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight drop-shadow-lg">
            {current.title}
          </h2>
          {current.description && (
            <p className="text-white/90 text-sm md:text-base line-clamp-2 font-medium">{current.description}</p>
          )}
          <Link
            href={`/games/${current.slug}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-extrabold rounded-2xl
                       shadow-[0_5px_0_0_rgba(0,0,0,0.25)]
                       hover:shadow-[0_7px_0_0_rgba(0,0,0,0.25)]
                       hover:-translate-y-0.5
                       active:shadow-[0_2px_0_0_rgba(0,0,0,0.25)]
                       active:translate-y-1
                       transition-all duration-150"
          >
            <Play size={18} fill="currentColor" /> PLAY NOW
          </Link>
        </div>
      </div>

      {games.length > 1 && (
        <>
          <button
            onClick={() => setIndex((i) => (i - 1 + games.length) % games.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/95 hover:bg-white rounded-full text-blue-600 shadow-[0_3px_0_0_rgba(0,0,0,0.25)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setIndex((i) => (i + 1) % games.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/95 hover:bg-white rounded-full text-blue-600 shadow-[0_3px_0_0_rgba(0,0,0,0.25)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight size={20} />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {games.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`transition-all rounded-full ${i === index ? 'w-8 h-2.5 bg-white' : 'w-2.5 h-2.5 bg-white/50 hover:bg-white/80'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
