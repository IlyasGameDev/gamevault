'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { GameWithCategories } from '@/lib/types/database';
import Badge from '@/components/ui/Badge';

interface FeaturedCarouselProps {
  games: GameWithCategories[];
}

export default function FeaturedCarousel({ games }: FeaturedCarouselProps) {
  const [index, setIndex] = useState(0);
  const current = games[index];

  useEffect(() => {
    if (games.length <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % games.length), 5000);
    return () => clearInterval(t);
  }, [games.length]);

  if (!current) return null;

  return (
    <div className="relative w-full aspect-[21/9] md:aspect-[3/1] rounded-2xl overflow-hidden group">
      {/* Background */}
      {current.cover_url || current.thumbnail_url ? (
        <Image
          src={current.cover_url ?? current.thumbnail_url!}
          alt={current.title}
          fill
          priority
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="100vw"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-purple-900" />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex items-center">
        <div className="px-8 md:px-16 max-w-lg space-y-4">
          <div className="flex items-center gap-2">
            {current.categories.slice(0, 2).map((cat) => (
              <Badge key={cat.id} variant="blue">{cat.name}</Badge>
            ))}
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">{current.title}</h2>
          {current.description && (
            <p className="text-gray-300 text-sm md:text-base line-clamp-2">{current.description}</p>
          )}
          <Link
            href={`/games/${current.slug}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-500/30"
          >
            <Play size={18} fill="white" /> Play Now
          </Link>
        </div>
      </div>

      {/* Navigation arrows */}
      {games.length > 1 && (
        <>
          <button
            onClick={() => setIndex((i) => (i - 1 + games.length) % games.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setIndex((i) => (i + 1) % games.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors opacity-0 group-hover:opacity-100"
          >
            <ChevronRight size={20} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {games.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`transition-all rounded-full ${i === index ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/60'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
