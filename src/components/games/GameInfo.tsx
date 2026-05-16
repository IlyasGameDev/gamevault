import Link from 'next/link';
import { Tag } from 'lucide-react';
import { GameWithCategories } from '@/lib/types/database';
import Badge from '@/components/ui/Badge';

interface GameInfoProps {
  game: GameWithCategories;
  embedded?: boolean;
}

export default function GameInfo({ game, embedded = false }: GameInfoProps) {
  return (
    <div className={embedded ? 'space-y-6' : 'space-y-6 rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-5'}>
      {game.description && (
        <div>
          <h2 className="mb-2 text-sm font-extrabold uppercase text-[#A8A8A8]">About this game</h2>
          <p className="text-sm leading-6 text-[#D8D8D8]">{game.description}</p>
        </div>
      )}

      {game.instructions && (
        <div>
          <h2 className="mb-2 text-sm font-extrabold uppercase text-[#A8A8A8]">Controls</h2>
          <p className="whitespace-pre-wrap text-sm leading-6 text-[#D8D8D8]">{game.instructions}</p>
        </div>
      )}

      {game.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <Tag size={14} className="text-[#A8A8A8]" />
          {game.tags.map((tag) => (
            <Link key={tag} href={`/search?q=${encodeURIComponent(tag)}`}>
              <Badge variant="default" className="cursor-pointer hover:opacity-80">#{tag}</Badge>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
