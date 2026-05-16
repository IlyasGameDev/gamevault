'use client';
import { useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { Heart, Share2, Flag, Maximize2, Minimize2 } from 'lucide-react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { Game } from '@/lib/types/database';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import GameReactions from '@/components/games/GameReactions';

interface GameActionsProps {
  game: Game;
  variant?: 'default' | 'toolbar' | 'share';
  fullscreen?: boolean;
  onFullscreenToggle?: () => void;
}

export default function GameActions({
  game,
  variant = 'default',
  fullscreen = false,
  onFullscreenToggle,
}: GameActionsProps) {
  const { user } = useAuthContext();
  const [isFav, setIsFav] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('favorites')
      .select('id')
      .eq('game_id', game.id)
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => setIsFav(!!data));
  }, [supabase, user, game.id]);

  async function toggleFavorite() {
    if (!user) { toast.error('Sign in to save favorites'); return; }
    setFavLoading(true);
    try {
      if (isFav) {
        await fetch(`/api/favorites?game_id=${game.id}`, { method: 'DELETE' });
        setIsFav(false);
        toast.success('Removed from favorites');
      } else {
        await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ game_id: game.id }),
        });
        setIsFav(true);
        toast.success('Added to favorites!');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setFavLoading(false);
    }
  }

  function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: game.title, url });
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  }

  function handleReport() {
    if (!user) { toast.error('Sign in to report'); return; }
    setReportOpen(true);
  }

  function submitReport() {
    if (!reportReason.trim()) return;
    // In production, send to a reports table or email
    toast.success('Report submitted. Thank you!');
    setReportOpen(false);
    setReportReason('');
  }

  const controls = variant === 'share' ? (
    <button
      onClick={handleShare}
      className="inline-flex h-11 items-center gap-2 rounded-full bg-[#3B3A58] px-5 text-base font-black text-white transition-colors hover:bg-[#4A496B]"
    >
      <Share2 size={20} strokeWidth={2.5} /> Share
    </button>
  ) : variant === 'toolbar' ? (
    <div className="flex items-center justify-end gap-1.5">
      <GameReactions gameId={game.id} />
      <button
        onClick={toggleFavorite}
        disabled={favLoading}
        className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
          isFav
            ? 'bg-[#6C5CFF]/25 text-[#C7BFFF] hover:bg-[#6C5CFF]/35'
            : 'bg-[#2B2A43] text-[#F5F4FF] hover:bg-[#363552]'
        }`}
        title={isFav ? 'Saved' : 'Favorite'}
        aria-label={isFav ? 'Saved' : 'Favorite'}
      >
        <Heart size={20} strokeWidth={2.4} className={isFav ? 'fill-current' : ''} />
      </button>
      <ToolbarButton onClick={handleShare} label="Share">
        <Share2 size={20} strokeWidth={2.4} />
      </ToolbarButton>
      <ToolbarButton onClick={handleReport} label="Report">
        <Flag size={19} strokeWidth={2.4} />
      </ToolbarButton>
      {onFullscreenToggle && (
        <ToolbarButton onClick={onFullscreenToggle} label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
          {fullscreen ? <Minimize2 size={20} strokeWidth={2.4} /> : <Maximize2 size={20} strokeWidth={2.4} />}
        </ToolbarButton>
      )}
    </div>
  ) : (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={toggleFavorite}
        disabled={favLoading}
        className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition-all ${
          isFav
            ? 'border-[#6C5CFF]/50 bg-[#6C5CFF]/15 text-[#9B8CFF] hover:bg-[#6C5CFF]/25'
            : 'border-[#2A2A2A] bg-[#1A1A1A] text-[#D8D8D8] hover:bg-[#242424] hover:text-white'
        }`}
      >
        <Heart size={16} className={isFav ? 'fill-current' : ''} />
        {isFav ? 'Saved' : 'Favorite'}
      </button>

      <button
        onClick={handleShare}
        className="flex items-center gap-2 rounded-full border border-[#2A2A2A] bg-[#1A1A1A] px-4 py-2 text-sm font-bold text-[#D8D8D8] transition-all hover:bg-[#242424] hover:text-white"
      >
        <Share2 size={16} /> Share
      </button>

      <button
        onClick={handleReport}
        className="flex items-center gap-2 rounded-full border border-[#2A2A2A] bg-[#1A1A1A] px-4 py-2 text-sm font-bold text-[#D8D8D8] transition-all hover:bg-red-500/10 hover:text-red-400"
      >
        <Flag size={16} /> Report
      </button>
    </div>
  );

  return (
    <>
      {controls}

      <Modal open={reportOpen} onClose={() => setReportOpen(false)} title="Report Game" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-400">Why are you reporting {game.title}?</p>
          <div className="space-y-2">
            {['Broken / not loading', 'Inappropriate content', 'Wrong category', 'Copyright issue', 'Other'].map((reason) => (
              <label key={reason} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="reason"
                  value={reason}
                  checked={reportReason === reason}
                  onChange={() => setReportReason(reason)}
                  className="accent-[#6C5CFF]"
                />
                <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{reason}</span>
              </label>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            <Button onClick={submitReport} disabled={!reportReason} className="flex-1">Submit Report</Button>
            <Button variant="ghost" onClick={() => setReportOpen(false)} className="flex-1">Cancel</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

function ToolbarButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2B2A43] text-[#F5F4FF] transition-colors hover:bg-[#363552]"
      title={label}
      aria-label={label}
    >
      {children}
    </button>
  );
}
