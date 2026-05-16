import { getConfiguredSiteUrl } from '@/lib/siteUrl';

export const SITE_NAME = 'YoPlayables';
export const SITE_DESCRIPTION = 'Play free WebGL and browser games instantly. No downloads, no installs.';
export const SITE_URL = getConfiguredSiteUrl();

export const GAMES_PER_PAGE = 24;
export const COMMENTS_PER_PAGE = 20;

export const SORT_OPTIONS = [
  { label: 'Most Popular', value: 'popular' },
  { label: 'Top Rated', value: 'rated' },
  { label: 'Newest', value: 'newest' },
  { label: 'A–Z', value: 'alpha' },
] as const;

export type SortOption = typeof SORT_OPTIONS[number]['value'];

export const DEFAULT_GAME_WIDTH = 960;
export const DEFAULT_GAME_HEIGHT = 640;
export const MAX_UPLOAD_SIZE_MB = 50;
export const MAX_AVATAR_SIZE_MB = 2;
