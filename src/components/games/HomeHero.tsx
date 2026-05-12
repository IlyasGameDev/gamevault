'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Play, Star } from 'lucide-react';
import { GameWithCategories } from '@/lib/types/database';

const BUBBLES = [
  'Smash hit incoming!',
  'Daily picks just dropped',
  'Top players are online',
  'Beat the high score!',
];

export default function HomeHero({ games }: { games: GameWithCategories[] }) {
  const [index, setIndex] = useState(0);
  const [bubble, setBubble] = useState(BUBBLES[0]);
  const current = games[index];

  useEffect(() => {
    if (games.length <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % games.length), 5000);
    return () => clearInterval(t);
  }, [games.length]);

  useEffect(() => {
    setBubble(BUBBLES[Math.floor(Math.random() * BUBBLES.length)]);
  }, [index]);

  if (!current) {
    return (
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9] rounded-[2rem] bg-gradient-to-br from-sky-300 via-blue-400 to-blue-600 border-4 border-white shadow-[0_8px_0_0_rgba(43,89,195,0.6)] flex flex-col items-center justify-center gap-4">
        <span className="text-7xl">🎮</span>
        <p className="text-white font-extrabold text-xl">Add a featured game in admin!</p>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Floating speech bubble */}
      <div className="absolute -top-4 right-6 sm:right-12 z-20 animate-bounce-slow">
        <div className="relative bg-pink-400 text-white px-4 py-2 rounded-2xl border-[3px] border-white shadow-[0_4px_0_0_#be185d] font-extrabold text-xs sm:text-sm whitespace-nowrap">
          {bubble}
          <span className="absolute -bottom-2 left-6 w-3 h-3 bg-pink-400 border-r-[3px] border-b-[3px] border-white rotate-45" />
        </div>
      </div>

      {/* Floating speech bubble #2 */}
      <div className="hidden sm:block absolute top-8 left-6 z-20">
        <div className="relative bg-yellow-400 text-yellow-900 px-3 py-1.5 rounded-2xl border-[3px] border-white shadow-[0_3px_0_0_#b45309] font-extrabold text-xs">
          ⭐ {(current.rating_avg || 5).toFixed(1)} stars
          <span className="absolute -bottom-2 right-4 w-3 h-3 bg-yellow-400 border-r-[3px] border-b-[3px] border-white rotate-45" />
        </div>
      </div>

      {/* Hero card */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9] rounded-[2rem] overflow-hidden border-4 border-white shadow-[0_8px_0_0_rgba(43,89,195,0.6)]">
        {current.cover_url || current.thumbnail_url ? (
          <Image
            src={current.cover_url ?? current.thumbnail_url!}
            alt={current.title}
            fill
            priority
            className="object-cover scale-110"
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-sky-300 via-blue-400 to-blue-600" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-900/30 to-transparent" />

        {/* Decorative twinkles */}
        <div className="absolute top-6 right-1/3 text-white/80 text-2xl animate-pulse">✨</div>
        <div className="absolute top-1/3 left-12 text-white/60 text-xl animate-pulse delay-300">⭐</div>
        <div className="absolute bottom-1/2 right-12 text-white/70 text-lg animate-pulse delay-500">✨</div>

        {/* Bottom content */}
        <div className="absolute bottom-0 inset-x-0 p-5 sm:p-8 flex flex-col items-center text-center gap-3 sm:gap-4">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.3)] leading-tight max-w-2xl">
            {current.title}
          </h2>

          {/* Big chunky play button — the centerpiece */}
          <Link
            href={`/games/${current.slug}`}
            className="group inline-flex items-center gap-3 bg-yellow-400 text-yellow-900 px-8 sm:px-12 py-3.5 sm:py-4
                       rounded-full border-[3px] border-white font-extrabold text-lg sm:text-xl
                       shadow-[0_6px_0_0_#b45309]
                       hover:-translate-y-0.5 hover:shadow-[0_8px_0_0_#b45309]
                       active:translate-y-1 active:shadow-[0_2px_0_0_#b45309]
                       transition-all duration-150"
          >
            <span className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-inner">
              <Play size={14} className="text-yellow-600 ml-0.5" fill="currentColor" />
            </span>
            PLAY NOW
            <Star size={20} fill="currentColor" className="text-yellow-600 group-hover:rotate-12 transition-transform" />
          </Link>

          {/* Tab dots */}
          {games.length > 1 && (
            <div className="flex items-center gap-1.5">
              {games.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className={`transition-all rounded-full ${i === index ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/50'}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
