'use client';

import { useEffect, useState } from 'react';
import { ThumbsDown, ThumbsUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatNumber } from '@/lib/utils';

type Reaction = 'like' | 'dislike';

interface ReactionState {
  likes: number;
  dislikes: number;
  viewerReaction: Reaction | null;
}

interface GameReactionsProps {
  gameId: string;
}

const initialState: ReactionState = {
  likes: 0,
  dislikes: 0,
  viewerReaction: null,
};

export default function GameReactions({ gameId }: GameReactionsProps) {
  const [state, setState] = useState<ReactionState>(initialState);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadReactions() {
      try {
        const response = await fetch(`/api/reactions?game_id=${gameId}`, {
          cache: 'no-store',
          credentials: 'same-origin',
        });
        if (!response.ok) throw new Error('Failed to load reactions');
        const payload = await response.json();
        if (!cancelled) {
          setState({
            likes: payload.likes ?? 0,
            dislikes: payload.dislikes ?? 0,
            viewerReaction: payload.viewerReaction ?? null,
          });
        }
      } catch {
        if (!cancelled) setState(initialState);
      }
    }

    loadReactions();
    return () => {
      cancelled = true;
    };
  }, [gameId]);

  async function react(reaction: Reaction) {
    if (submitting) return;

    const previous = state;
    const nextReaction = state.viewerReaction === reaction ? null : reaction;
    setSubmitting(true);
    setState(applyReaction(state, nextReaction));

    try {
      const response = await fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ game_id: gameId, reaction: nextReaction }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? 'Failed to save reaction');
      setState({
        likes: payload.likes ?? 0,
        dislikes: payload.dislikes ?? 0,
        viewerReaction: payload.viewerReaction ?? null,
      });
    } catch {
      setState(previous);
      toast.error('Could not save your vote');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex shrink-0 items-center gap-1.5" aria-label="Game reactions">
      <ReactionButton
        label="Like"
        active={state.viewerReaction === 'like'}
        count={state.likes}
        disabled={submitting}
        onClick={() => react('like')}
      >
        <ThumbsUp size={20} strokeWidth={2.4} />
      </ReactionButton>
      <ReactionButton
        label="Dislike"
        active={state.viewerReaction === 'dislike'}
        count={state.dislikes}
        disabled={submitting}
        onClick={() => react('dislike')}
      >
        <ThumbsDown size={20} strokeWidth={2.4} />
      </ReactionButton>
    </div>
  );
}

function applyReaction(state: ReactionState, nextReaction: Reaction | null): ReactionState {
  const next = { ...state, viewerReaction: nextReaction };

  if (state.viewerReaction === 'like') next.likes = Math.max(0, next.likes - 1);
  if (state.viewerReaction === 'dislike') next.dislikes = Math.max(0, next.dislikes - 1);
  if (nextReaction === 'like') next.likes += 1;
  if (nextReaction === 'dislike') next.dislikes += 1;

  return next;
}

function ReactionButton({
  label,
  active,
  count,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active: boolean;
  count: number;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex h-10 min-w-[74px] items-center justify-center gap-2 rounded-full px-3 text-sm font-black transition-colors disabled:cursor-wait ${
        active
          ? 'bg-[#22E58F]/15 text-[#36F0A1] ring-1 ring-[#36F0A1]/40'
          : 'bg-[#2B2A43] text-[#F5F4FF] hover:bg-[#363552]'
      }`}
      title={label}
      aria-label={`${label}: ${count}`}
      aria-pressed={active}
    >
      {children}
      <span className="tabular-nums">{formatNumber(count)}</span>
    </button>
  );
}
