import 'server-only';

import { unstable_cache } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { GAMES_PER_PAGE, type SortOption } from '@/lib/constants';
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
    else if (sort === 'rated') query = query.gt('rating_count', 0).order('rating_avg', { ascending: false }).order('rating_count', { ascending: false });
    else query = query.order('published_at', { ascending: false });

    const { data, error } = await query.order('id');
    if (error) throw error;
    return normalizeGames(data);
  },
  ['homepage-games'],
  { revalidate: HOMEPAGE_REVALIDATE_SECONDS, tags: ['games', 'ratings'] }
);

type CatalogPageOptions = {
  page?: number;
  limit?: number;
  sort?: SortOption;
  category?: string;
  search?: string;
};

export async function getCatalogPage(
  { page = 1, limit = GAMES_PER_PAGE, sort = 'alpha', category, search }: CatalogPageOptions,
  status = 'published',
): Promise<{ games: GameWithCategories[]; count: number }> {
  const size = Math.min(Math.max(1, limit), 200);
  const from = (Math.max(1, page) - 1) * size;
  const fields = category
    ? '*,categories:game_categories(category:categories(*)),membership:game_categories!inner(category:categories!inner(slug))'
    : '*,categories:game_categories(category:categories(*))';
  let query = supabaseAdmin.from('games').select(fields, { count: 'exact' }).range(from, from + size - 1);

  if (status !== 'all') query = query.eq('status', status);
  if (category) query = query.eq('membership.category.slug', category);
  if (search) query = query.ilike('title', `%${search}%`);

  if (sort === 'popular') query = query.order('play_count', { ascending: false });
  else if (sort === 'rated') query = query.gt('rating_count', 0).order('rating_avg', { ascending: false }).order('rating_count', { ascending: false });
  else if (sort === 'newest') query = query.order('published_at', { ascending: false });
  else query = query.order('title');

  const { data, count, error } = await query.order('id');
  if (error?.code === 'PGRST103') return { games: [], count: 0 };
  if (error) throw error;
  return { games: normalizeGames(data), count: count ?? 0 };
}

export const getPublishedGamesPage = unstable_cache(
  (options: CatalogPageOptions) => getCatalogPage(options),
  ['published-games-page-v2'],
  { revalidate: HOMEPAGE_REVALIDATE_SECONDS, tags: ['games', 'ratings'] },
);
