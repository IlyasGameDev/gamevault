'use client';
import { useState } from 'react';
import { Star } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Game } from '@/lib/types/database';
import toast from 'react-hot-toast';

interface GameRatingProps {
  game: Game;
  userRating?: number;
}

export default function GameRating({ game, userRating: initialRating }: GameRatingProps) {
  const { user } = useAuth();
  const [hover, setHover] = useState(0);
  const [rating, setRating] = useState(initialRating ?? 0);
  const [submitting, setSubmitting] = useState(false);

  async function handleRate(score: number) {
    if (!user) { toast.error('Sign in to rate games'); return; }
    setSubmitting(true);
    try {
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game_id: game.id, score }),
      });
      if (!res.ok) throw new Error();
      setRating(score);
      toast.success('Rating saved!');
    } catch {
      toast.error('Failed to save rating');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              disabled={submitting}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              onClick={() => handleRate(star)}
              className="transition-transform hover:scale-110 disabled:cursor-not-allowed"
            >
              <Star
                size={22}
                className={
                  star <= (hover || rating)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-600'
                }
              />
            </button>
          ))}
        </div>
        <div className="text-sm text-gray-500">
          {game.rating_count > 0 ? (
            <span>{game.rating_avg.toFixed(1)} / 5 · {game.rating_count} ratings</span>
          ) : (
            <span>No ratings yet</span>
          )}
        </div>
      </div>
      {!user && <p className="text-xs text-gray-600">Sign in to rate this game</p>}
    </div>
  );
}
