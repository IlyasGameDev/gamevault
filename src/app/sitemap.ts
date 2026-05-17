import { MetadataRoute } from 'next';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { SITE_URL } from '@/lib/constants';
import { LANDING_PAGE_CONFIGS } from '@/lib/seo';
import { getCategoriesWithPublishedGames } from '@/lib/categories';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data: games } = await supabaseAdmin
    .from('games')
    .select('slug, updated_at')
    .eq('status', 'published');

  const categories = await getCategoriesWithPublishedGames();

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

  const landingRoutes = Object.values(LANDING_PAGE_CONFIGS).map((landingPage) => ({
    url: `${SITE_URL}/${landingPage.slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/games`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/about`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/privacy-policy`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/terms-of-service`, changeFrequency: 'monthly', priority: 0.3 },
    ...gameRoutes,
    ...categoryRoutes,
    ...landingRoutes,
  ];
}
