'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { CommentWithProfile } from '@/lib/types/database';
import { timeAgo } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { CornerDownRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface CommentWithReplies extends CommentWithProfile {
  replies?: CommentWithProfile[];
}

interface GameCommentsProps {
  gameId: string;
}

function CommentItem({
  comment,
  gameId,
  onReplyPosted,
  depth = 0,
}: {
  comment: CommentWithReplies;
  gameId: string;
  onReplyPosted: (parentId: string, reply: CommentWithProfile) => void;
  depth?: number;
}) {
  const { user } = useAuth();
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submitReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyText.trim() || !user) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game_id: gameId, content: replyText, parent_id: comment.id }),
      });
      const { data } = await res.json();
      if (data) {
        onReplyPosted(comment.id, data);
        setReplyText('');
        setReplyOpen(false);
        toast.success('Reply posted!');
      }
    } catch {
      toast.error('Failed to post reply');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={depth > 0 ? 'ml-8 border-l-2 border-white/5 pl-4' : ''}>
      <div className="bg-[#1a1d2e] rounded-xl p-4 border border-white/5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-indigo-600/40 flex items-center justify-center text-xs font-bold text-indigo-300">
              {(comment.profiles?.display_name ?? comment.profiles?.username ?? 'U')[0].toUpperCase()}
            </div>
            <span className="text-sm font-medium text-white">
              {comment.profiles?.display_name ?? comment.profiles?.username}
            </span>
            {depth > 0 && <span className="text-xs text-indigo-400 flex items-center gap-1"><CornerDownRight size={10} /> reply</span>}
          </div>
          <span className="text-xs text-gray-600">{timeAgo(comment.created_at)}</span>
        </div>
        <p className="text-sm text-gray-300 whitespace-pre-wrap">{comment.content}</p>

        {depth === 0 && user && (
          <button
            onClick={() => setReplyOpen((v) => !v)}
            className="mt-2 text-xs text-gray-500 hover:text-indigo-400 transition-colors"
          >
            {replyOpen ? 'Cancel' : '↩ Reply'}
          </button>
        )}
      </div>

      {replyOpen && (
        <form onSubmit={submitReply} className="mt-2 ml-4 space-y-2">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            rows={2}
            maxLength={1000}
            className="w-full px-4 py-2.5 bg-[#1a1d2e] border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 resize-none text-sm"
          />
          <div className="flex gap-2">
            <Button type="submit" size="sm" loading={submitting} disabled={!replyText.trim()}>Post Reply</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setReplyOpen(false)}>Cancel</Button>
          </div>
        </form>
      )}

      {(comment.replies ?? []).map((reply) => (
        <div key={reply.id} className="mt-2">
          <CommentItem comment={reply} gameId={gameId} onReplyPosted={onReplyPosted} depth={depth + 1} />
        </div>
      ))}
    </div>
  );
}

export default function GameComments({ gameId }: GameCommentsProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentWithReplies[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/comments?game_id=${gameId}`)
      .then((r) => r.json())
      .then(({ data }) => { setComments(data ?? []); setLoading(false); });
  }, [gameId]);

  function handleReplyPosted(parentId: string, reply: CommentWithProfile) {
    setComments((prev) =>
      prev.map((c) =>
        c.id === parentId ? { ...c, replies: [...(c.replies ?? []), reply] } : c
      )
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || !user) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game_id: gameId, content }),
      });
      const { data } = await res.json();
      if (data) {
        setComments([{ ...data, replies: [] }, ...comments]);
        setContent('');
        toast.success('Comment posted!');
      }
    } catch {
      toast.error('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white">Comments {comments.length > 0 && <span className="text-gray-500 font-normal text-base">({comments.length})</span>}</h3>

      {user ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts..."
            rows={3}
            maxLength={1000}
            className="w-full px-4 py-3 bg-[#1a1d2e] border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 resize-none text-sm"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">{content.length}/1000</span>
            <Button type="submit" size="sm" loading={submitting} disabled={!content.trim()}>Post comment</Button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-gray-500">
          <a href="/login" className="text-indigo-400 hover:underline">Sign in</a> to leave a comment
        </p>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse space-y-2">
              <div className="h-3 bg-white/5 rounded w-1/4" />
              <div className="h-4 bg-white/5 rounded" />
              <div className="h-4 bg-white/5 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-500">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              gameId={gameId}
              onReplyPosted={handleReplyPosted}
            />
          ))}
        </div>
      )}
    </div>
  );
}
