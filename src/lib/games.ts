import 'server-only';

import { unstable_cache } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { GameWithCategories } from '@/lib/types/database';

const HOMEPAGE_REVALIDATE_SECONDS = 300;

function normalizeGames(data: unknown[] | null): GameWithCategories[] {
  return (((data ?? []) as Record<string, unknown>[]).map((game) => ({
    ...game,
    categories: ((game.categories as { category: unknown }[]) ?? []).map((gc) => gc.category),
  }))) as GameWithCategories[];
}

export const getFeaturedGames = unstable_cache(
  async (limit = 5): Promise<GameWithCategories[]> => {
    const { data } = await supabaseAdmin
      .from('games')
      .select('*, categories:game_categories(category:categories(*))')
      .eq('status', 'published')
      .eq('is_featured', true)
      .order('updated_at', { ascending: false })
      .limit(limit);

    return normalizeGames(data);
  },
  ['homepage-featured-games'],
  { revalidate: HOMEPAGE_REVALIDATE_SECONDS, tags: ['games'] }
);

export const getHomepageGames = unstable_cache(
  async (sort: 'newest' | 'popular' | 'rated', limit = 8): Promise<GameWithCategories[]> => {
    let query = supabaseAdmin
      .from('games')
      .select('*, categories:game_categories(category:categories(*))')
      .eq('status', 'published')
      .limit(limit);

    if (sort === 'popular') query = query.order('play_count', { ascending: false });
    else if (sort === 'rated') query = query.order('rating_avg', { ascending: false });
    else query = query.order('published_at', { ascending: false });

    const { data } = await query;
    return normalizeGames(data);
  },
  ['homepage-games'],
  { revalidate: HOMEPAGE_REVALIDATE_SECONDS, tags: ['games'] }
);
