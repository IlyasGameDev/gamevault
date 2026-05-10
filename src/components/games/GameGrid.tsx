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
      ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'
      : 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4';

  if (loading) {
    return (
      <div className={gridClass}>
        {Array.from({ length: 8 }).map((_, i) => (
          <GameCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!games.length) {
    return (
      <div className="text-center py-16 text-gray-500">
        <span className="text-4xl mb-4 block">🎮</span>
        No games found
      </div>
    );
  }

  return (
    <div className={gridClass}>
      {games.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  );
}
