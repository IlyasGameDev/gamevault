import 'server-only';

import { unstable_cache } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { Category } from '@/lib/types/database';

const getAllCategoriesWithPublishedGames = unstable_cache(async (): Promise<Category[]> => {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('*, membership:game_categories!inner(games!inner())')
    .eq('membership.games.status', 'published')
    .limit(1, { referencedTable: 'membership' })
    .order('display_order')
    .order('name');
  if (error) throw error;
  return data ?? [];
}, ['published-game-categories-v2'], { revalidate: 300, tags: ['games', 'categories'] });

export async function getCategoriesWithPublishedGames(limit?: number): Promise<Category[]> {
  const categories = await getAllCategoriesWithPublishedGames();
  return typeof limit === 'number' ? categories.slice(0, limit) : categories;
}
