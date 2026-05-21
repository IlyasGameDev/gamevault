import 'server-only';

import { unstable_cache } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { GAMES_PER_PAGE } from '@/lib/constants';
import { GameWithCategories } from '@/lib/types/database';

const HOMEPAGE_REVALIDATE_SECONDS = 300;
type GameSort = 'newest' | 'popular' | 'rated' | 'alpha';

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

export const getPublishedGamesPage = unstable_cache(
  async ({
    page = 1,
    limit = GAMES_PER_PAGE,
    sort = 'newest',
  }: {
    page?: number;
    limit?: number;
    sort?: GameSort;
  } = {}): Promise<{ games: GameWithCategories[]; count: number }> => {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(Math.max(1, limit), 200);
    const from = (safePage - 1) * safeLimit;
    const to = from + safeLimit - 1;

    let query = supabaseAdmin
      .from('games')
      .select('*, categories:game_categories(category:categories(*))', { count: 'exact' })
      .eq('status', 'published')
      .range(from, to);

    if (sort === 'popular') query = query.order('play_count', { ascending: false });
    else if (sort === 'rated') query = query.order('rating_avg', { ascending: false });
    else if (sort === 'alpha') query = query.order('title', { ascending: true });
    else query = query.order('published_at', { ascending: false });

    const { data, count, error } = await query;
    if (error) throw error;

    return {
      games: normalizeGames(data),
      count: count ?? 0,
    };
  },
  ['published-games-page'],
  { revalidate: HOMEPAGE_REVALIDATE_SECONDS, tags: ['games'] }
);

export const getPublishedGameCount = unstable_cache(
  async (): Promise<number> => {
    const { count, error } = await supabaseAdmin
      .from('games')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'published');

    if (error) throw error;
    return count ?? 0;
  },
  ['published-game-count'],
  { revalidate: HOMEPAGE_REVALIDATE_SECONDS, tags: ['games'] }
);
