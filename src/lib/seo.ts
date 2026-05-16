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
  whyTitle: string;
  whyBody: string;
  categorySlug?: string;
};

const CATEGORY_SEO_OVERRIDES: Record<string, CategorySeoOverride> = {
  action: {
    title: 'Free Action Games Online',
    description: `Play free action games online on ${SITE_NAME}. Discover fighting, running, survival, battle, and arcade-style browser games with no download required.`,
    intro: `Play free action games online on ${SITE_NAME}. Choose from fast browser games with fighting, running, shooting, survival, battle arenas, and arcade challenges that launch instantly with no download.`,
    secondary: 'Explore action games for desktop and mobile, including 3D adventures, stickman battles, zombie shooters, runners, and casual combat games built for quick sessions.',
  },
  puzzle: {
    title: 'Free Puzzle Games Online',
    description: `Play free puzzle games online on ${SITE_NAME}. Solve logic, matching, sorting, and brain-training browser games instantly on desktop or mobile.`,
    intro: `Play free puzzle games online on ${SITE_NAME}. Solve logic challenges, matching games, sorting games, physics puzzles, and relaxing brain teasers directly in your browser.`,
    secondary: 'Browse quick puzzle games for desktop and mobile, including number games, color sorting, tile matching, and clever level-based challenges with no installation needed.',
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

const CATEGORY_STRATEGY_TIPS: Record<string, string> = {
  action: 'Watch enemy patterns, stay mobile, and react quickly as the pace ramps up.',
  puzzle: 'Plan a few moves ahead and look for simple patterns before making a big move.',
  racing: 'Carry speed through corners, learn the track, and smooth out each run to improve your time.',
  shooting: 'Stay accurate, track movement carefully, and balance offense with survival.',
  arcade: 'Focus on timing, rhythm, and repeatable patterns so your score climbs steadily.',
  sports: 'Use quick reactions and consistent timing to outplay the challenge or opponent.',
  adventure: 'Explore carefully, learn each obstacle, and use each attempt to improve your route.',
  multiplayer: 'Stay flexible, react to other players quickly, and capitalize on openings.',
  stickman: 'Use momentum and timing to control each move and avoid simple mistakes.',
  '3d': 'Use camera perspective and movement together so you can react early and stay in control.',
  io: 'Play aggressively when it is safe, but protect your progress so you can stay in the match longer.',
  clicker: 'Prioritize efficient upgrades early so progress accelerates as the session continues.',
};

export const LANDING_PAGE_CONFIGS: Record<string, LandingPageConfig> = {
  'free-online-games': {
    slug: 'free-online-games',
    title: 'Play Free Online Games',
    description: `Play free online games on ${SITE_NAME}. Discover browser games across action, puzzle, racing, sports, arcade, and multiplayer categories with no download.`,
    intro: `Play free online games on ${SITE_NAME} without installing anything. Explore action games, puzzle games, racing games, sports games, multiplayer games, and casual browser games that launch instantly.`,
    secondary: 'Our collection is built for quick play sessions on desktop, tablet, and mobile, with new games added regularly across the most popular genres.',
    whyTitle: 'Why Play Free Online Games?',
    whyBody: 'Online browser games are easy to start, simple to share, and great for short breaks or longer play sessions because they run instantly in modern browsers.',
  },
  'free-browser-games': {
    slug: 'free-browser-games',
    title: 'Free Browser Games Online | No Download Games',
    description: `Play free browser games online on ${SITE_NAME}. Enjoy WebGL and HTML5 games instantly with no download on desktop, tablet, and mobile.`,
    intro: `Play free browser games online on ${SITE_NAME} without downloads or installs. Our collection includes action games, puzzle games, racing games, sports games, arcade games, and multiplayer games that run directly in your web browser.`,
    secondary: 'Choose a game and start instantly on desktop, tablet, or mobile. Everything is designed for quick access, easy sharing, and smooth browser play.',
    whyTitle: 'Why Play Browser Games?',
    whyBody: 'Browser games are quick to start, easy to share, and flexible across devices, which makes them ideal for instant entertainment without waiting through installs or updates.',
  },
  'free-action-games': {
    slug: 'free-action-games',
    title: 'Free Action Games Online',
    description: `Play free action games online on ${SITE_NAME}. Discover fighting, battle, and survival browser games with instant play and no download.`,
    intro: `Play free action games online on ${SITE_NAME}. Find browser games packed with combat, reflex challenges, running, survival, and arcade-style action.`,
    secondary: 'Jump into quick sessions on desktop or mobile and explore action-focused games that launch instantly in modern browsers.',
    whyTitle: 'Why Play Action Games?',
    whyBody: 'Action games deliver quick excitement, simple controls, and strong replay value, making them a natural fit for instant browser play.',
    categorySlug: 'action',
  },
  'free-puzzle-games': {
    slug: 'free-puzzle-games',
    title: 'Free Puzzle Games Online',
    description: `Play free puzzle games online on ${SITE_NAME}. Solve logic, sorting, matching, and brain-training browser games instantly.`,
    intro: `Play free puzzle games online on ${SITE_NAME}. Enjoy logic games, sorting games, matching challenges, and relaxing brain teasers with no download.`,
    secondary: 'These quick browser puzzle games are easy to start on desktop or mobile and are perfect for short, thoughtful play sessions.',
    whyTitle: 'Why Play Puzzle Games?',
    whyBody: 'Puzzle games are easy to pick up, rewarding to master, and great for players who enjoy strategy, patterns, and problem solving.',
    categorySlug: 'puzzle',
  },
  'free-racing-games': {
    slug: 'free-racing-games',
    title: 'Free Racing Games Online',
    description: `Play free racing games online on ${SITE_NAME}. Enjoy car, bike, drift, and stunt browser games instantly with no download.`,
    intro: `Play free racing games online on ${SITE_NAME}. Speed through tracks, drift around turns, and take on browser-based driving challenges instantly.`,
    secondary: 'From arcade racing to stunt games, these titles are built for fast sessions on desktop, tablet, and mobile.',
    whyTitle: 'Why Play Racing Games?',
    whyBody: 'Racing games are perfect for browser play because they are easy to jump into, skill-based, and fun to replay as you improve your time.',
    categorySlug: 'racing',
  },
  'free-shooting-games': {
    slug: 'free-shooting-games',
    title: 'Free Shooting Games Online',
    description: `Play free shooting games online on ${SITE_NAME}. Discover sniper, survival, and arcade shooter browser games with instant access.`,
    intro: `Play free shooting games online on ${SITE_NAME}. Take on browser shooter challenges with target practice, arena battles, survival runs, and more.`,
    secondary: 'These games are built for quick reaction-based play on desktop and mobile, with no download required.',
    whyTitle: 'Why Play Shooting Games?',
    whyBody: 'Shooting games combine reflexes, accuracy, and replayability, which makes them a strong match for short browser sessions.',
    categorySlug: 'shooting',
  },
  'free-arcade-games': {
    slug: 'free-arcade-games',
    title: 'Free Arcade Games Online',
    description: `Play free arcade games online on ${SITE_NAME}. Enjoy high-score browser games, reflex challenges, and instant-play classics.`,
    intro: `Play free arcade games online on ${SITE_NAME}. Browse quick browser challenges built around timing, score chasing, and classic pick-up-and-play fun.`,
    secondary: 'Arcade games work especially well for short sessions, whether you are playing on desktop, tablet, or mobile.',
    whyTitle: 'Why Play Arcade Games?',
    whyBody: 'Arcade games are simple to start and hard to put down, with fast rounds and strong replay value that fit browser play perfectly.',
    categorySlug: 'arcade',
  },
  'free-2-player-games': {
    slug: 'free-2-player-games',
    title: 'Free 2 Player Games Online',
    description: `Play free 2 player games online on ${SITE_NAME}. Enjoy browser games for versus matches, co-op play, and quick shared sessions.`,
    intro: `Play free 2 player games online on ${SITE_NAME}. Choose browser games built for local competition, co-op challenges, and quick shared fun.`,
    secondary: 'These instant-play games are ideal for friends, siblings, or anyone who wants to jump into a quick multiplayer round together.',
    whyTitle: 'Why Play 2 Player Games?',
    whyBody: '2 player games are easy to share and fun to replay, making them especially effective on devices where you want immediate side-by-side action.',
    categorySlug: '2-player',
  },
  'free-mobile-games': {
    slug: 'free-mobile-games',
    title: 'Free Mobile Games Online',
    description: `Play free mobile games online on ${SITE_NAME}. Enjoy browser games that work smoothly on phones and tablets with no download needed.`,
    intro: `Play free mobile games online on ${SITE_NAME}. Our browser-based collection works across phones and tablets, so you can start instantly without visiting an app store.`,
    secondary: 'Explore action, puzzle, racing, arcade, and casual games designed for quick sessions and easy touch-friendly play in modern mobile browsers.',
    whyTitle: 'Why Play Mobile Browser Games?',
    whyBody: 'Mobile browser games are convenient because they start quickly, do not need storage space, and let you jump into a game from almost any device.',
  },
  'free-io-games': {
    slug: 'free-io-games',
    title: 'Free IO Games Online',
    description: `Play free IO games online on ${SITE_NAME}. Discover fast multiplayer browser games with survival, arena battles, and leaderboard action.`,
    intro: `Play free IO games online on ${SITE_NAME}. Jump into fast browser-based multiplayer games with competitive matches, survival mechanics, and quick restarts.`,
    secondary: 'IO games are built for instant replay and easy sharing, whether you are chasing a high score or battling for control of the arena.',
    whyTitle: 'Why Play IO Games?',
    whyBody: 'IO games are simple to learn, highly replayable, and ideal for quick browser sessions with a competitive edge.',
    categorySlug: 'io',
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
  const primaryCategory = game.categories[0];
  const categoryLabel = normalizeCategoryLabel(primaryCategory?.name ?? 'Browser', primaryCategory?.slug);
  const description = game.description?.trim();
  const aboutBody = description
    ? `${ensureSentence(description)} ${game.title} works directly in your browser, so you can play on desktop, tablet, and mobile without downloading anything.`
    : `${game.title} is a free online ${categoryLabel.toLowerCase()} game on ${SITE_NAME}. It is designed for instant browser play on desktop, tablet, and mobile with no download required.`;

  const seoDescription = trimToLength(
    description
      ? `${stripTrailingPunctuation(description)} Play ${game.title} online for free on ${SITE_NAME} with no download on desktop or mobile.`
      : `Play ${game.title} online for free on ${SITE_NAME}. Enjoy this ${categoryLabel.toLowerCase()} browser game instantly with no download on desktop or mobile.`,
    165
  );

  return {
    title: `Play ${game.title} Online Free`,
    description: seoDescription,
    h1: `Play ${game.title} Online`,
    intro: description
      ? `${ensureSentence(description)} Play instantly in your browser on desktop, tablet, or mobile.`
      : `Play ${game.title} online for free on ${SITE_NAME}. This ${categoryLabel.toLowerCase()} browser game launches instantly with no download on desktop, tablet, or mobile.`,
    aboutHeading: `About ${game.title}`,
    aboutBody,
    howToPlayHeading: `How to Play ${game.title}`,
    howToPlayBody: game.instructions?.trim()
      ? `Use the controls below to jump in quickly and work through each challenge. ${getCategoryStrategyTip(primaryCategory?.slug)}`
      : `Jump in instantly and learn each round as you play. ${getCategoryStrategyTip(primaryCategory?.slug)}`,
    controlsHeading: 'Controls',
    controlItems: getControlItems(game.instructions),
    whyHeading: `Why Play ${game.title} on ${SITE_NAME}?`,
    whyPlayItems: [
      'Free to play online',
      'No download needed',
      'Works in modern browsers',
      'Playable on desktop and mobile',
    ],
  };
}

export function getLandingPageConfig(slug: string) {
  return LANDING_PAGE_CONFIGS[slug];
}

function getControlItems(instructions?: string | null) {
  const normalized = instructions
    ?.split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (normalized && normalized.length > 0) {
    return normalized.slice(0, 6);
  }

  return ['Mouse click, keyboard, or tap controls based on the game mode and your device.'];
}

function getCategoryStrategyTip(slug?: string) {
  return CATEGORY_STRATEGY_TIPS[slug ?? ''] ?? 'Focus on timing, learn the objective quickly, and improve with each run.';
}

function normalizeCategoryLabel(name: string, slug?: string) {
  if (slug === 'io' || name === '.IO') return 'IO';
  if (slug === '2-player') return '2 Player';
  return name;
}

function ensureSentence(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

function stripTrailingPunctuation(value: string) {
  return value.trim().replace(/[.!?]+$/, '');
}

function trimToLength(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1).trimEnd()}…`;
}
