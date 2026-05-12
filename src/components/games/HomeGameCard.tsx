'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Play, Star } from 'lucide-react';
import { GameWithCategories } from '@/lib/types/database';
import { formatNumber } from '@/lib/utils';

export default function HomeGameCard({ game }: { game: GameWithCategories }) {
  return (
    <Link
      href={`/games/${game.slug}`}
      className="group block bg-white rounded-3xl overflow-hidden border-4 border-white
                 shadow-[0_6px_0_0_rgba(43,89,195,0.55)]
                 hover:shadow-[0_8px_0_0_rgba(43,89,195,0.55)]
                 hover:-translate-y-1
                 active:shadow-[0_2px_0_0_rgba(43,89,195,0.55)]
                 active:translate-y-1
                 transition-all duration-150"
    >
      <div className="relative aspect-video bg-blue-100 overflow-hidden">
        {game.thumbnail_url ? (
          <Image
            src={game.thumbnail_url}
            alt={game.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-sky-300 to-blue-400 flex items-center justify-center text-5xl">
            🎮
          </div>
        )}

        {game.rating_count > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2.5 py-1 bg-yellow-400 rounded-full text-xs font-extrabold text-yellow-900 shadow-[0_2px_0_0_#b8860b]">
            <Star size={11} fill="currentColor" />
            {game.rating_avg.toFixed(1)}
          </div>
        )}

        <div className="absolute inset-0 bg-blue-900/0 group-hover:bg-blue-900/40 transition-colors flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-white opacity-0 group-hover:opacity-100 flex items-center justify-center shadow-[0_4px_0_0_rgba(0,0,0,0.2)] transition-opacity">
            <Play size={22} className="text-blue-600 ml-0.5" fill="currentColor" />
          </div>
        </div>
      </div>
      <div className="px-3 pt-2 pb-3 bg-white">
        <h3 className="font-extrabold text-slate-800 text-sm truncate">{game.title}</h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[11px] font-bold text-blue-500 uppercase tracking-wide truncate">
            {game.categories[0]?.name ?? 'Game'}
          </span>
          <span className="text-[11px] text-slate-400 font-semibold whitespace-nowrap">
            {formatNumber(game.play_count)} ▶
          </span>
        </div>
      </div>
    </Link>
  );
}
