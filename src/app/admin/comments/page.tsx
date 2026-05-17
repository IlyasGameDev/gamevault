'use client';
import { useState, useEffect } from 'react';
import { CommentWithProfile } from '@/lib/types/database';
import CommentModerationCard from '@/components/admin/CommentModerationCard';

type Filter = 'all' | 'flagged' | 'hidden';

type AdminComment = CommentWithProfile & {
  game?: { title: string; slug: string };
};

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    let cancelled = false;

    void Promise.resolve().then(() => {
      if (!cancelled) setLoading(true);
    });

    fetch(`/api/admin/comments?filter=${filter}`)
      .then((r) => r.json())
      .then(({ data }) => {
        if (cancelled) return;
        setComments(data ?? []);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filter]);

  function updateComment(id: string, changes: Partial<CommentWithProfile>) {
    setComments((cs) => cs.map((c) => c.id === id ? { ...c, ...changes } : c));
  }

  function deleteComment(id: string) {
    setComments((cs) => cs.filter((c) => c.id !== id));
  }

  const FILTERS: { id: Filter; label: string; desc: string }[] = [
    { id: 'all', label: 'All', desc: 'All comments' },
    { id: 'flagged', label: 'Flagged', desc: 'Reported by users' },
    { id: 'hidden', label: 'Hidden', desc: 'Hidden from public' },
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Comment Moderation</h1>
        {!loading && (
          <span className="text-sm text-gray-500">{comments.length} comments</span>
        )}
      </div>

      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f.id
                ? 'bg-indigo-600 text-white'
                : 'bg-[#1a1d2e] text-gray-400 hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse bg-[#1a1d2e] rounded-xl" />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center text-gray-500 py-16">No comments found</div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <CommentModerationCard
              key={comment.id}
              comment={comment}
              onUpdate={updateComment}
              onDelete={deleteComment}
            />
          ))}
        </div>
      )}
    </div>
  );
}
