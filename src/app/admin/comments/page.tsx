'use client';
import { useState, useEffect } from 'react';
import { CommentWithProfile } from '@/lib/types/database';
import CommentModerationCard from '@/components/admin/CommentModerationCard';

type Filter = 'all' | 'flagged' | 'hidden';

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<(CommentWithProfile & { game?: { title: string; slug: string } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    fetch('/api/comments?game_id=admin&page=1')
      .then((r) => r.json())
      .then(({ data }) => { setComments(data ?? []); setLoading(false); });
  }, []);

  const filtered = comments.filter((c) => {
    if (filter === 'flagged') return c.is_flagged;
    if (filter === 'hidden') return c.is_hidden;
    return true;
  });

  function updateComment(id: string, changes: Partial<CommentWithProfile>) {
    setComments((cs) => cs.map((c) => c.id === id ? { ...c, ...changes } : c));
  }

  function deleteComment(id: string) {
    setComments((cs) => cs.filter((c) => c.id !== id));
  }

  const FILTERS: { id: Filter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'flagged', label: 'Flagged' },
    { id: 'hidden', label: 'Hidden' },
  ];

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold text-white">Comment Moderation</h1>

      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f.id ? 'bg-indigo-600 text-white' : 'bg-[#1a1d2e] text-gray-400 hover:text-white'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-16">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-gray-500 py-16">No comments found</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((comment) => (
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
