import type { Metadata } from 'next';
import GamesClient from './GamesClient';
import { GAMES_PER_PAGE } from '@/lib/constants';
import { getPublishedGamesPage } from '@/lib/games';

export const metadata: Metadata = {
  title: 'Browse Games',
  description: 'Browse free online browser games on YoPlayables. Explore popular, new, top-rated, and category-specific games with no download required.',
  alternates: {
    canonical: '/games',
  },
  openGraph: {
    title: 'Browse Games',
    description: 'Browse free online browser games on YoPlayables. Explore popular, new, top-rated, and category-specific games with no download required.',
    url: '/games',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Browse Games',
    description: 'Browse free online browser games on YoPlayables. Explore popular, new, top-rated, and category-specific games with no download required.',
  },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeSort(sort: string | undefined) {
  if (sort === 'popular' || sort === 'rated' || sort === 'alpha') return sort;
  return 'newest';
}

export default async function GamesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const sort = normalizeSort(getParam(params.sort));
  const hasClientFilters = Boolean(getParam(params.q) || getParam(params.category));
  const initial = hasClientFilters
    ? { games: [], count: 0 }
    : await getPublishedGamesPage({ page: 1, limit: GAMES_PER_PAGE, sort });

  return (
    <GamesClient
      initialGames={initial.games}
      initialTotal={initial.count}
      initialHasMore={initial.count > GAMES_PER_PAGE}
      initialSort={sort}
      hasInitialClientFilters={hasClientFilters}
    />
  );
}
