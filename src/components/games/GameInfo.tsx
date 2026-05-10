import Link from 'next/link';
import { ExternalLink, Tag } from 'lucide-react';
import { GameWithCategories } from '@/lib/types/database';
import Badge from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';

interface GameInfoProps {
  game: GameWithCategories;
}

export default function GameInfo({ game }: GameInfoProps) {
  return (
    <div className="space-y-6">
      {/* Title + meta */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">{game.title}</h1>
        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
          {game.developer && (
            <span>
              By{' '}
              {game.developer_url ? (
                <a href={game.developer_url} target="_blank" rel="noopener noreferrer"
                  className="text-indigo-400 hover:underline inline-flex items-center gap-1">
                  {game.developer} <ExternalLink size={12} />
                </a>
              ) : (
                <span className="text-gray-400">{game.developer}</span>
              )}
            </span>
          )}
          {game.published_at && <span>Released {formatDate(game.published_at)}</span>}
        </div>
      </div>

      {/* Categories */}
      {game.categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {game.categories.map((cat) => (
            <Link key={cat.id} href={`/categories/${cat.slug}`}>
              <Badge variant="blue" className="cursor-pointer hover:opacity-80">
                {cat.icon && <span className="mr-1">{cat.icon}</span>}{cat.name}
              </Badge>
            </Link>
          ))}
        </div>
      )}

      {/* Description */}
      {game.description && (
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">About</h2>
          <p className="text-gray-300 text-sm leading-relaxed">{game.description}</p>
        </div>
      )}

      {/* Instructions */}
      {game.instructions && (
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">How to Play</h2>
          <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{game.instructions}</p>
        </div>
      )}

      {/* Tags */}
      {game.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <Tag size={14} className="text-gray-600" />
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
