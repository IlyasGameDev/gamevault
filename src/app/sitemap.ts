import { MetadataRoute } from 'next';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { SITE_URL } from '@/lib/constants';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data: games } = await supabaseAdmin
    .from('games')
    .select('slug, updated_at')
    .eq('status', 'published');

  const { data: categories } = await supabaseAdmin
    .from('categories')
    .select('slug');

  const gameRoutes = (games ?? []).map((g) => ({
    url: `${SITE_URL}/games/${g.slug}`,
    lastModified: new Date(g.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const categoryRoutes = (categories ?? []).map((c) => ({
    url: `${SITE_URL}/categories/${c.slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/games`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/categories`, changeFrequency: 'weekly', priority: 0.7 },
    ...gameRoutes,
    ...categoryRoutes,
  ];
}
