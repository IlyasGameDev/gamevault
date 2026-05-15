import { GameWithCategories } from '@/lib/types/database';
import GameCard from './GameCard';
import { GameCardSkeleton } from '@/components/ui/Skeleton';

interface GameGridProps {
  games?: GameWithCategories[];
  loading?: boolean;
  cols?: number;
}

export default function GameGrid({ games = [], loading, cols = 4 }: GameGridProps) {
  const gridClass =
    cols === 5
      ? 'grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
      : 'grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4';
  const uniqueGames = games.filter((game, index, allGames) =>
    allGames.findIndex((candidate) => candidate.id === game.id) === index
  );

  if (loading) {
    return (
      <div className={gridClass}>
        {Array.from({ length: 8 }).map((_, i) => (
          <GameCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!uniqueGames.length) {
    return (
      <div className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] py-16 text-center text-[#A8A8A8]">
        No games found
      </div>
    );
  }

  return (
    <div className={gridClass}>
      {uniqueGames.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  );
}
