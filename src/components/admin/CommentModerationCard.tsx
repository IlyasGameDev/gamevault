'use client';
import { useState } from 'react';
import { Eye, EyeOff, Trash2, Flag } from 'lucide-react';
import { CommentWithProfile } from '@/lib/types/database';
import { timeAgo } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import toast from 'react-hot-toast';

interface CommentModerationCardProps {
  comment: CommentWithProfile & { game?: { title: string; slug: string } };
  onUpdate: (id: string, changes: Partial<CommentWithProfile>) => void;
  onDelete: (id: string) => void;
}

export default function CommentModerationCard({ comment, onUpdate, onDelete }: CommentModerationCardProps) {
  const [loading, setLoading] = useState(false);

  async function toggleHide() {
    setLoading(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: comment.id, is_hidden: !comment.is_hidden }),
      });
      if (!res.ok) throw new Error();
      onUpdate(comment.id, { is_hidden: !comment.is_hidden });
      toast.success(comment.is_hidden ? 'Comment unhidden' : 'Comment hidden');
    } catch {
      toast.error('Failed to update comment');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this comment?')) return;
    setLoading(true);
    try {
      await fetch(`/api/comments?id=${comment.id}`, { method: 'DELETE' });
      onDelete(comment.id);
      toast.success('Comment deleted');
    } catch {
      toast.error('Failed to delete comment');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`bg-[#1a1d2e] rounded-xl p-4 border ${comment.is_hidden ? 'border-red-500/20 opacity-60' : 'border-white/5'}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-sm font-medium text-white">
              {comment.profiles?.display_name ?? comment.profiles?.username}
            </span>
            <span className="text-xs text-gray-600">{timeAgo(comment.created_at)}</span>
            {comment.is_flagged && <Badge variant="warning"><Flag size={10} className="mr-1" />Flagged</Badge>}
            {comment.is_hidden && <Badge variant="danger">Hidden</Badge>}
            {comment.game && (
              <span className="text-xs text-gray-600">on <span className="text-indigo-400">{comment.game.title}</span></span>
            )}
          </div>
          <p className="text-sm text-gray-300">{comment.content}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="sm" onClick={toggleHide} loading={loading} title={comment.is_hidden ? 'Unhide' : 'Hide'}>
            {comment.is_hidden ? <Eye size={14} /> : <EyeOff size={14} />}
          </Button>
          <Button variant="danger" size="sm" onClick={handleDelete} loading={loading} title="Delete">
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}
