'use client';
import { useState, useEffect } from 'react';
import { Heart, Share2, Flag } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Game } from '@/lib/types/database';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

interface GameActionsProps {
  game: Game;
}

export default function GameActions({ game }: GameActionsProps) {
  const { user } = useAuth();
  const [isFav, setIsFav] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;
    supabase
      .from('favorites')
      .select('id')
      .eq('game_id', game.id)
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => setIsFav(!!data));
  }, [user, game.id]);

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

  return (
    <>
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
