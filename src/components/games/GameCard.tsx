'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Play, Star } from 'lucide-react';
import { GameWithCategories } from '@/lib/types/database';
import { formatNumber } from '@/lib/utils';
import Badge from '@/components/ui/Badge';

interface GameCardProps {
  game: GameWithCategories;
}

export default function GameCard({ game }: GameCardProps) {
  return (
    <Link
      href={`/games/${game.slug}`}
      className="group block rounded-xl overflow-hidden bg-[#1a1d2e] border border-white/5 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-0.5"
    >
      <div className="relative aspect-video overflow-hidden">
        {game.thumbnail_url ? (
          <Image
            src={game.thumbnail_url}
            alt={game.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 to-purple-900/50 flex items-center justify-center">
            <span className="text-4xl">🎮</span>
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/50">
            <Play size={20} className="text-white ml-0.5" fill="white" />
          </div>
        </div>
        {/* Rating badge */}
        {game.rating_count > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-black/70 backdrop-blur-sm rounded-full text-xs text-yellow-400">
            <Star size={10} fill="currentColor" />
            {game.rating_avg.toFixed(1)}
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-white text-sm truncate">{game.title}</h3>
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-1 flex-wrap">
            {game.categories.slice(0, 2).map((cat) => (
              <Badge key={cat.id} variant="default" className="text-[10px]">{cat.name}</Badge>
            ))}
          </div>
          <span className="text-[10px] text-gray-600">{formatNumber(game.play_count)} plays</span>
        </div>
      </div>
    </Link>
  );
}
