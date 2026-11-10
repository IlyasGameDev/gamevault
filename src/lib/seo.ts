import { SITE_NAME } from '@/lib/constants';
import { Category, GameWithCategories } from '@/lib/types/database';

type CategorySeoOverride = {
  title: string;
  description: string;
  intro: string;
  secondary: string;
};

type LandingPageConfig = {
  slug: string;
  title: string;
  description: string;
  intro: string;
  secondary: string;
};

const CATEGORY_SEO_OVERRIDES: Record<string, CategorySeoOverride> = {
  action: {
    title: 'Free Action Games Online',
    description: `Play free action games online on ${SITE_NAME}. Discover fighting, running, survival, battle, and arcade-style browser games with no download required.`,
    intro: `Play free action games online on ${SITE_NAME}. Choose from fast browser games with fighting, running, shooting, survival, battle arenas, and arcade challenges that launch instantly with no download.`,
    secondary: 'Explore action games for desktop and mobile, including 3D adventures, stickman battles, zombie shooters, runners, and casual combat games built for quick sessions.',
  },
  puzzle: {
    title: 'Free Puzzle Games Online - No Download',
    description: `Play free puzzle games online on ${SITE_NAME}. Try logic, sorting, matching, hidden object, and brain-teaser games in your browser with no download.`,
    intro: `Play free puzzle games online without installing anything. Start a quick sorting game, match tiles, hunt for hidden objects, or slow down with a logic puzzle that runs right in your browser.`,
    secondary: 'This collection is built for short breaks and longer thinking sessions, with puzzle games that work on desktop, tablet, and mobile.',
  },
  racing: {
    title: 'Free Racing Games Online',
    description: `Play free racing games online on ${SITE_NAME}. Enjoy car, bike, drift, and stunt browser games instantly with no download.`,
    intro: `Play free racing games online on ${SITE_NAME}. Jump into car games, bike races, drift challenges, stunt tracks, and time-trial browser games that start instantly.`,
    secondary: 'Find racing games for desktop and mobile, from arcade driving and off-road racing to 3D speed runs and quick challenge modes built for browser play.',
  },
  shooting: {
    title: 'Free Shooting Games Online',
    description: `Play free shooting games online on ${SITE_NAME}. Discover aim, survival, sniper, and arcade shooter browser games with no download.`,
    intro: `Play free shooting games online on ${SITE_NAME}. Choose from sniper games, arena battles, target practice, survival shooters, and arcade combat challenges that run in your browser.`,
    secondary: 'Explore shooting games for desktop and mobile, including 3D shooters, stickman battles, zombie defense games, and fast score-chasing action with instant play.',
  },
  arcade: {
    title: 'Free Arcade Games Online',
    description: `Play free arcade games online on ${SITE_NAME}. Enjoy quick browser games packed with high scores, reflex challenges, and classic pick-up-and-play action.`,
    intro: `Play free arcade games online on ${SITE_NAME}. Discover quick browser games with score chasing, timing, reflex tests, platform challenges, and classic arcade-style fun.`,
    secondary: 'Browse instant-play arcade games for desktop and mobile, from retro-inspired challenges and endless runners to skill games designed for short sessions.',
  },
  sports: {
    title: 'Free Sports Games Online',
    description: `Play free sports games online on ${SITE_NAME}. Enjoy browser games for soccer, basketball, racing, and skill-based competition with no download.`,
    intro: `Play free sports games online on ${SITE_NAME}. Compete in browser-based soccer games, basketball games, skill challenges, and other quick sports experiences with instant access.`,
    secondary: 'Find sports games for desktop and mobile that focus on timing, precision, tournaments, and quick competitive rounds without installs or downloads.',
  },
  adventure: {
    title: 'Free Adventure Games Online',
    description: `Play free adventure games online on ${SITE_NAME}. Explore browser games with quests, levels, exploration, and story-driven challenges.`,
    intro: `Play free adventure games online on ${SITE_NAME}. Explore quests, platforming levels, exploration challenges, and browser adventures that launch instantly.`,
    secondary: 'Browse adventure games for desktop and mobile, including 3D exploration, obstacle courses, action-adventure games, and casual mission-based play.',
  },
  multiplayer: {
    title: 'Free Multiplayer Games Online',
    description: `Play free multiplayer games online on ${SITE_NAME}. Discover browser games for 2-player matches, shared competition, and social challenges.`,
    intro: `Play free multiplayer games online on ${SITE_NAME}. Jump into browser games built for shared competition, co-op sessions, quick matches, and party-style challenges.`,
    secondary: 'Explore multiplayer games for desktop and mobile, including local 2-player games, competitive arena games, and quick browser matches with no download.',
  },
  stickman: {
    title: 'Free Stickman Games Online',
    description: `Play free stickman games online on ${SITE_NAME}. Browse action, fighting, racing, and shooting stickman browser games with instant play.`,
    intro: `Play free stickman games online on ${SITE_NAME}. Discover browser games with stickman fighting, running, racing, shooting, and obstacle-based challenges.`,
    secondary: 'Find stickman games for desktop and mobile, from ragdoll action and platform levels to casual combat games and fast arcade runs.',
  },
  '3d': {
    title: 'Free 3D Games Online',
    description: `Play free 3D games online on ${SITE_NAME}. Enjoy immersive browser games with racing, action, puzzle, and simulation gameplay in 3D.`,
    intro: `Play free 3D games online on ${SITE_NAME}. Explore browser games with richer visuals, immersive stages, and fast-loading 3D gameplay across multiple genres.`,
    secondary: 'Browse 3D games for desktop and mobile, including driving games, action challenges, obstacle courses, and puzzles that run directly in modern browsers.',
  },
  io: {
    title: 'Free IO Games Online',
    description: `Play free IO games online on ${SITE_NAME}. Discover fast multiplayer browser games with arena battles, survival, and competitive leaderboard action.`,
    intro: `Play free IO games online on ${SITE_NAME}. Jump into fast browser games with arena combat, survival rounds, quick matchmaking, and competitive score chasing.`,
    secondary: 'Explore IO games for desktop and mobile, including snake-style battles, territory games, survival challenges, and easy-to-share multiplayer sessions.',
  },
  girls: {
    title: 'Free Girls Games Online',
    description: `Play free girls games online on ${SITE_NAME}. Enjoy browser games for fashion, makeovers, cooking, puzzles, and creative play with no download.`,
    intro: `Play free girls games online on ${SITE_NAME}. Browse browser games focused on creativity, fashion, makeovers, cooking, puzzles, and casual play.`,
    secondary: 'Find girls games for desktop and mobile, including dress-up games, salon games, cooking games, and quick creative challenges that load instantly.',
  },
  cooking: {
    title: 'Free Cooking Games Online',
    description: `Play free cooking games online on ${SITE_NAME}. Enjoy restaurant, baking, kitchen, and food-themed browser games instantly.`,
    intro: `Play free cooking games online on ${SITE_NAME}. Step into restaurant games, baking challenges, food prep games, and kitchen simulations directly in your browser.`,
    secondary: 'Browse cooking games for desktop and mobile, from time-management restaurant games to simple recipe challenges and casual food-themed adventures.',
  },
  soccer: {
    title: 'Free Soccer Games Online',
    description: `Play free soccer games online on ${SITE_NAME}. Enjoy penalty kicks, matches, skill shots, and football browser games instantly.`,
    intro: `Play free soccer games online on ${SITE_NAME}. Play browser-based football games with penalty kicks, matches, trick shots, and quick competitive challenges.`,
    secondary: 'Explore soccer games for desktop and mobile, including arcade football, tournament play, free kicks, and goal-scoring skill games with no download.',
  },
  clicker: {
    title: 'Free Clicker Games Online',
    description: `Play free clicker games online on ${SITE_NAME}. Discover idle, incremental, and tapping browser games with fast progression and instant play.`,
    intro: `Play free clicker games online on ${SITE_NAME}. Enjoy idle browser games, tapping challenges, progression loops, and upgrade systems built for quick play sessions.`,
    secondary: 'Browse clicker games for desktop and mobile, including casual incremental games, merge-style progression, and relaxing browser experiences with no install.',
  },
  '2-player': {
    title: 'Free 2 Player Games Online',
    description: `Play free 2 player games online on ${SITE_NAME}. Enjoy browser games for head-to-head matches, co-op rounds, and shared quick-play fun.`,
    intro: `Play free 2 player games online on ${SITE_NAME}. Choose browser games built for local versus matches, co-op challenges, and fast shared sessions.`,
    secondary: 'Explore 2 player games for desktop and mobile, including sports battles, arcade duels, and quick multiplayer rounds that start instantly in the browser.',
  },
};

export const LANDING_PAGE_CONFIGS: Record<string, LandingPageConfig> = {
  'free-2-player-games': {
    slug: 'free-2-player-games',
    title: 'Free 2 Player Games Online',
    description: `Play free 2 player games online on ${SITE_NAME}. Enjoy browser games for versus matches, co-op play, and quick shared sessions.`,
    intro: `Play free 2 player games online on ${SITE_NAME}. Choose browser games built for local competition, co-op challenges, and quick shared fun.`,
    secondary: 'These instant-play games are ideal for friends, siblings, or anyone who wants to jump into a quick multiplayer round together.',
  },
  'free-mobile-games': {
    slug: 'free-mobile-games',
    title: 'Free Mobile Games Online',
    description: `Play free mobile games online on ${SITE_NAME}. Enjoy browser games that work smoothly on phones and tablets with no download needed.`,
    intro: `Play free mobile games online on ${SITE_NAME}. Our browser-based collection works across phones and tablets, so you can start instantly without visiting an app store.`,
    secondary: 'Explore action, puzzle, racing, arcade, and casual games designed for quick sessions and easy touch-friendly play in modern mobile browsers.',
  },
};

export function getCategorySeo(category: Pick<Category, 'slug' | 'name' | 'description'>) {
  const override = CATEGORY_SEO_OVERRIDES[category.slug];

  if (override) {
    return override;
  }

  const categoryLabel = normalizeCategoryLabel(category.name, category.slug);
  const lowerLabel = categoryLabel.toLowerCase();

  return {
    title: `Free ${categoryLabel} Games Online`,
    description: `Play free ${lowerLabel} games online on ${SITE_NAME}. Browse instant-play browser games with no download on desktop, tablet, and mobile.`,
    intro: `Play free ${lowerLabel} games online on ${SITE_NAME}. Discover browser games in this category that launch instantly with no download or installation required.`,
    secondary: `Explore ${lowerLabel} games for desktop and mobile, including quick-play titles, casual challenges, and popular browser favorites.`,
  };
}

export function getGameSeo(game: GameWithCategories) {
  const intro = game.description || `Play ${game.title} in your browser on ${SITE_NAME}.`;
  return {
    title: `Play ${game.title} Online Free`,
    h1: `Play ${game.title} Online`,
    description: intro.length > 165 ? intro.slice(0, 164).replace(/\s+\S*$/, '') + '…' : intro,
    intro,
  };
}

export function getLandingPageConfig(slug: string) {
  return Object.hasOwn(LANDING_PAGE_CONFIGS, slug) ? LANDING_PAGE_CONFIGS[slug] : undefined;
}

function normalizeCategoryLabel(name: string, slug?: string) {
  if (slug === 'io' || name === '.IO') return 'IO';
  if (slug === '2-player') return '2 Player';
  return name;
}
