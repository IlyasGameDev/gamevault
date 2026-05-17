import Link from 'next/link';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import FeaturedCarousel from '@/components/games/FeaturedCarousel';
import GameGrid from '@/components/games/GameGrid';
import AllGamesSection from '@/components/games/AllGamesSection';
import { ChevronRight } from 'lucide-react';
import GameIcon, { GameIconType } from '@/components/ui/GameIcon';
import { getCategoriesWithPublishedGames } from '@/lib/categories';
import { getFeaturedGames, getHomepageGames } from '@/lib/games';

type HomepageChip = {
  label: string;
  href: string;
  icon: string;
  active?: boolean;
};

const HOMEPAGE_CHIPS: HomepageChip[] = [
  { label: 'Trending', href: '/popular-games', active: true, icon: 'hot' },
  { label: 'New', href: '/new-games', icon: 'new' },
];

export const metadata: Metadata = {
  title: { absolute: 'YoPlayables - Play Free Online Browser Games' },
  description: 'Play free online games on YoPlayables. Enjoy WebGL and HTML5 browser games instantly with no download on desktop, tablet, and mobile.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'YoPlayables - Play Free Online Browser Games',
    description: 'Play free online games on YoPlayables. Enjoy WebGL and HTML5 browser games instantly with no download on desktop, tablet, and mobile.',
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YoPlayables - Play Free Online Browser Games',
    description: 'Play free online games on YoPlayables. Enjoy WebGL and HTML5 browser games instantly with no download on desktop, tablet, and mobile.',
  },
};

export const revalidate = 300;

export default async function HomePage() {
  const [featured, trending, categories] = await Promise.all([
    getFeaturedGames(),
    getHomepageGames('popular', 8),
    getCategoriesWithPublishedGames(),
  ]);
  const heroGames = featured.length > 0 ? featured : trending.slice(0, 4);
  const categoryChips: HomepageChip[] = categories.slice(0, 8).map((category) => ({
    label: category.name,
    href: `/categories/${category.slug}`,
    icon: category.slug,
  }));
  const homepageChips = [HOMEPAGE_CHIPS[0], ...categoryChips, HOMEPAGE_CHIPS[1]];

  return (
    <main className="mx-auto max-w-7xl space-y-12 px-4 py-6 sm:px-6 sm:py-8">
      {heroGames.length > 0 && <FeaturedCarousel games={heroGames} />}

      <section className="rounded-3xl border border-[#262626] bg-[#161616] px-5 py-6 sm:px-8 sm:py-8">
        <div className="max-w-4xl space-y-4">
          <h1 className="text-3xl font-black text-white sm:text-4xl">Play Free Online Games on YoPlayables</h1>
          <p className="text-base leading-7 text-[#D8D8D8] sm:text-lg">
            Play free online games on YoPlayables whenever you want a quick browser game that starts instantly. YoPlayables brings together HTML5 and WebGL games across action, racing, puzzle, arcade, shooting, sports, multiplayer, and casual categories, with no downloads or installs required.
          </p>
          <p className="text-base leading-7 text-[#B8B8B8] sm:text-lg">
            Choose a game, click play, and jump straight into desktop, tablet, or mobile gameplay. The homepage highlights trending games, new browser games, top-rated picks, and mobile-friendly titles so players can find something fast whether they want a short break or a longer session.
          </p>
          <p className="text-base leading-7 text-[#B8B8B8] sm:text-lg">
            Browse by category to discover racing challenges, puzzle levels, arcade score chases, sports games, 2 player games, and multiplayer experiences. New games are added regularly, and every listed title is selected for instant play in modern web browsers.
          </p>
          <p className="text-base leading-7 text-[#B8B8B8] sm:text-lg">
            YoPlayables is built for players who want free online games without waiting on app stores, launchers, or large updates. Open a game page, start playing, and share your favorites with friends from one simple browser-based game library.
          </p>
        </div>
      </section>

      <nav className="flex gap-2 overflow-x-auto pb-1">
        {homepageChips.map((chip) => (
          <Link
            key={chip.label}
            href={chip.href}
            className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-colors ${
              chip.active
                ? 'bg-[#6C5CFF] text-white'
                : 'border border-[#2A2A2A] bg-[#1A1A1A] text-[#D8D8D8] hover:bg-[#242424] hover:text-white'
            }`}
          >
            <GameIcon type={chip.icon} size={15} className={chip.active ? 'text-white' : undefined} />
            {chip.label}
          </Link>
        ))}
      </nav>

      <section className="space-y-4">
        <SectionHeader title="Trending Games" href="/popular-games" linkLabel="See all trending games" icon="hot" />
        <GameGrid games={trending} />
      </section>

      <section className="space-y-4 [contain-intrinsic-size:520px] [content-visibility:auto]">
        <SectionHeader title="Browse by Category" href="/categories" linkLabel="See all categories" />
        <div className="flex flex-wrap gap-2">
          {categories.slice(0, 10).map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="inline-flex items-center gap-2 rounded-full border border-[#2A2A2A] bg-[#1A1A1A] px-4 py-2 text-sm font-bold text-[#D8D8D8] transition-colors hover:border-[#6C5CFF]/70 hover:text-white"
            >
              <GameIcon type={cat.slug} size={15} />
              {cat.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4 [contain-intrinsic-size:760px] [content-visibility:auto]">
        <SectionHeader title="New Games" href="/new-games" linkLabel="See all new games" icon="new" />
        <Suspense fallback={<GameGrid loading />}>
          <AsyncGameGrid sort="newest" />
        </Suspense>
      </section>

      <Suspense fallback={<PopularGamesFallback />}>
        <PopularGamesSection />
      </Suspense>

      <section className="space-y-4 [contain-intrinsic-size:900px] [content-visibility:auto]">
        <h2 className="text-xl font-extrabold text-white">All Games</h2>
        <AllGamesSection />
      </section>
    </main>
  );
}

async function AsyncGameGrid({ sort }: { sort: 'newest' | 'popular' | 'rated' }) {
  const games = await getHomepageGames(sort, 8);
  return <GameGrid games={games} />;
}

async function PopularGamesSection() {
  const topRated = await getHomepageGames('rated', 8);
  if (topRated.length === 0) return null;

  return (
    <section className="space-y-4 [contain-intrinsic-size:760px] [content-visibility:auto]">
      <SectionHeader title="Popular Games" href="/top-rated-games" linkLabel="See all top-rated games" icon="popular" />
      <GameGrid games={topRated} />
    </section>
  );
}

function PopularGamesFallback() {
  return (
    <section className="space-y-4 [contain-intrinsic-size:760px] [content-visibility:auto]">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-xl font-extrabold text-white">
          <GameIcon type="popular" size={21} />
          Popular Games
        </p>
        <Link href="/top-rated-games" className="flex items-center gap-1 text-sm font-bold text-[#A8A8A8] transition-colors hover:text-white">
          See all top-rated games <ChevronRight size={16} className="text-[#6C5CFF]" />
        </Link>
      </div>
      <GameGrid loading />
    </section>
  );
}

function SectionHeader({ title, href, linkLabel, icon }: { title: string; href: string; linkLabel: string; icon?: GameIconType }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="flex items-center gap-2 text-xl font-extrabold text-white">
        {icon && <GameIcon type={icon} size={21} />}
        {title}
      </h2>
      <Link href={href} className="flex items-center gap-1 text-sm font-bold text-[#A8A8A8] transition-colors hover:text-white">
        {linkLabel} <ChevronRight size={16} className="text-[#6C5CFF]" />
      </Link>
    </div>
  );
}
