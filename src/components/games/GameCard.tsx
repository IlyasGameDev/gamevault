import { gameText } from '@/lib/gameText';
import { canOptimizeGameImage } from '@/lib/gameImage';
import Link from 'next/link';
import Image from 'next/image';
import { Gamepad2 } from 'lucide-react';
import { GameWithCategories } from '@/lib/types/database';

interface GameCardProps {
  game: GameWithCategories;
}

export default function GameCard({ game }: GameCardProps) {
  const title = gameText(game.title);
  return (
    <Link
      href={`/games/${game.slug}`}
      className="group block overflow-hidden rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#6C5CFF]/70 hover:shadow-xl hover:shadow-black/30"
      aria-label={`Play ${title}`}
    >
      <div className="relative aspect-video overflow-hidden">
        {game.thumbnail_url ? (
          <Image
            src={game.thumbnail_url}
            alt={title}
            fill
            unoptimized={!canOptimizeGameImage(game.thumbnail_url)}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 639px) 48vw, (max-width: 1023px) 32vw, (max-width: 1280px) 24vw, 300px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[#202020]">
            <Gamepad2 size={34} className="text-[#A8A8A8]" />
          </div>
        )}
        <div className="absolute inset-0 flex items-end bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/60 group-hover:opacity-100">
          <div className="w-full p-3 sm:p-4">
            <p className="truncate text-sm font-extrabold text-white sm:text-base">{title}</p>
          </div>
        </div>
      </div>
      {game.rating_count > 0 && (
        <p className="px-3 py-2 text-sm text-gray-200">{title} · {game.rating_avg.toFixed(1)}/5 ({game.rating_count} {game.rating_count === 1 ? 'vote' : 'votes'})</p>
      )}
    </Link>
  );
}
