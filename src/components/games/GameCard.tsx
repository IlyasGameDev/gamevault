import Link from 'next/link';
import Image from 'next/image';
import { Gamepad2 } from 'lucide-react';
import { GameWithCategories } from '@/lib/types/database';

interface GameCardProps {
  game: GameWithCategories;
}

export default function GameCard({ game }: GameCardProps) {
  return (
    <Link
      href={`/games/${game.slug}`}
      className="group block overflow-hidden rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#6C5CFF]/70 hover:shadow-xl hover:shadow-black/30"
      aria-label={`Play ${game.title}`}
    >
      <div className="relative aspect-video overflow-hidden">
        {game.thumbnail_url ? (
          <Image
            src={game.thumbnail_url}
            alt={game.title}
            fill
            unoptimized
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[#202020]">
            <Gamepad2 size={34} className="text-[#A8A8A8]" />
          </div>
        )}
        <div className="absolute inset-0 flex items-end bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/60 group-hover:opacity-100">
          <div className="w-full p-3 sm:p-4">
            <h3 className="truncate text-sm font-extrabold text-white sm:text-base">{game.title}</h3>
          </div>
        </div>
      </div>
    </Link>
  );
}
