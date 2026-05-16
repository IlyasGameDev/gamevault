import 'server-only';

import { unstable_cache } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { Category } from '@/lib/types/database';

type GameCategoryRow = {
  categories?: { category?: Category | Category[] | null }[] | null;
};

const getAllCategoriesWithPublishedGames = unstable_cache(async (): Promise<Category[]> => {
  const { data } = await supabaseAdmin
    .from('games')
    .select('categories:game_categories(category:categories(*))')
    .eq('status', 'published');

  const categoryMap = new Map<string, Category>();

  ((data ?? []) as unknown as GameCategoryRow[]).forEach((game) => {
    (game.categories ?? []).forEach((entry) => {
      const category = Array.isArray(entry.category) ? entry.category[0] : entry.category;
      if (category) categoryMap.set(category.id, category);
    });
  });

  const categories = Array.from(categoryMap.values()).sort((a, b) => {
    const order = a.display_order - b.display_order;
    if (order !== 0) return order;
    return a.name.localeCompare(b.name);
  });

  return categories;
}, ['published-game-categories'], { revalidate: 300, tags: ['games', 'categories'] });

export async function getCategoriesWithPublishedGames(limit?: number): Promise<Category[]> {
  const categories = await getAllCategoriesWithPublishedGames();
  return typeof limit === 'number' ? categories.slice(0, limit) : categories;
}
