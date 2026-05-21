import { MetadataRoute } from 'next';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { GAMES_PER_PAGE, SITE_URL } from '@/lib/constants';
import { LANDING_PAGE_CONFIGS } from '@/lib/seo';
import { getCategoriesWithPublishedGames } from '@/lib/categories';
import { getPublishedGameCount } from '@/lib/games';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [games, categories, gameCount] = await Promise.all([
    getPublishedGamesForSitemap(),
    getCategoriesWithPublishedGames(),
    getPublishedGameCount(),
  ]);

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

  const archiveRoutes = Array.from(
    { length: Math.max(0, Math.ceil(gameCount / GAMES_PER_PAGE) - 1) },
    (_, index) => ({
      url: `${SITE_URL}/games/page/${index + 2}`,
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    })
  );

  return [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/games`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/popular-games`, changeFrequency: 'daily', priority: 0.85 },
    { url: `${SITE_URL}/new-games`, changeFrequency: 'daily', priority: 0.85 },
    { url: `${SITE_URL}/top-rated-games`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/about`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/privacy-policy`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/terms-of-service`, changeFrequency: 'monthly', priority: 0.3 },
    ...archiveRoutes,
    ...gameRoutes,
    ...categoryRoutes,
    ...landingRoutes,
  ];
}

async function getPublishedGamesForSitemap() {
  const batchSize = 1000;
  const games: { slug: string; updated_at: string }[] = [];

  for (let from = 0; ; from += batchSize) {
    const { data, error } = await supabaseAdmin
      .from('games')
      .select('slug, updated_at')
      .eq('status', 'published')
      .order('slug', { ascending: true })
      .range(from, from + batchSize - 1);

    if (error) throw error;
    if (!data?.length) break;

    games.push(...data);

    if (data.length < batchSize) break;
  }

  return games;
}
