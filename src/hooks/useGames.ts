'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { GameWithCategories } from '@/lib/types/database';
import { GAMES_PER_PAGE } from '@/lib/constants';

interface UseGamesOptions {
  category?: string;
  sort?: string;
  search?: string;
  page?: number;
}

export function useGames(options: UseGamesOptions = {}) {
  const [games, setGames] = useState<GameWithCategories[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      const { category, sort = 'newest', search, page = 1 } = options;
      const from = (page - 1) * GAMES_PER_PAGE;
      const to = from + GAMES_PER_PAGE - 1;

      let query = supabase
        .from('games')
        .select('*, categories:game_categories(category:categories(*))', { count: 'exact' })
        .eq('status', 'published')
        .range(from, to);

      if (search) query = query.ilike('title', `%${search}%`);
      if (sort === 'newest') query = query.order('published_at', { ascending: false });
      else if (sort === 'popular') query = query.order('play_count', { ascending: false });
      else if (sort === 'rated') query = query.order('rating_avg', { ascending: false });
      else if (sort === 'alpha') query = query.order('title', { ascending: true });

      const { data, count } = await query;
      const mapped = (data ?? []).map((g: Record<string, unknown>) => ({
        ...g,
        categories: ((g.categories as { category: unknown }[]) ?? []).map((gc) => gc.category),
      })) as GameWithCategories[];

      if (category) {
        const filtered = mapped.filter((g) =>
          g.categories.some((c) => c.slug === category)
        );
        setGames(filtered);
        setHasMore(false);
      } else {
        setGames(mapped);
        setHasMore((count ?? 0) > to + 1);
      }
      setLoading(false);
    }
    fetch();
  }, [options.category, options.sort, options.search, options.page]);

  return { games, loading, hasMore };
}
