'use client';
import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useFavorites(userId?: string) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    void Promise.resolve().then(() => {
      if (!cancelled) setLoading(true);
    });

    supabase
      .from('favorites')
      .select('game_id')
      .eq('user_id', userId)
      .then(({ data }) => {
        if (cancelled) return;
        setFavorites(new Set(data?.map((f) => f.game_id) ?? []));
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [supabase, userId]);

  async function toggle(gameId: string) {
    if (!userId) return;
    if (favorites.has(gameId)) {
      await supabase.from('favorites').delete().eq('game_id', gameId).eq('user_id', userId);
      setFavorites((prev) => { const s = new Set(prev); s.delete(gameId); return s; });
    } else {
      await supabase.from('favorites').insert({ game_id: gameId, user_id: userId });
      setFavorites((prev) => new Set([...prev, gameId]));
    }
  }

  return { favorites, loading, toggle, isFavorite: (id: string) => favorites.has(id) };
}
