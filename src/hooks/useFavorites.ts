'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useFavorites(userId?: string) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    supabase
      .from('favorites')
      .select('game_id')
      .eq('user_id', userId)
      .then(({ data }) => {
        setFavorites(new Set(data?.map((f) => f.game_id) ?? []));
        setLoading(false);
      });
  }, [userId]);

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
