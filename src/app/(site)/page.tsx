import Link from 'next/link';
import { Suspense } from 'react';
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
  { label: 'Trending', href: '/games?sort=popular', active: true, icon: 'hot' },
  { label: 'New', href: '/games?sort=newest', icon: 'new' },
];

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
        <SectionHeader title="Trending Games" href="/games?sort=popular" icon="hot" />
        <GameGrid games={trending} />
      </section>

      <section className="space-y-4 [contain-intrinsic-size:520px] [content-visibility:auto]">
        <SectionHeader title="Browse by Category" href="/categories" />
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
        <SectionHeader title="New Games" href="/games?sort=newest" icon="new" />
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
      <SectionHeader title="Popular Games" href="/games?sort=rated" icon="popular" />
      <GameGrid games={topRated} />
    </section>
  );
}

function PopularGamesFallback() {
  return (
    <section className="space-y-4 [contain-intrinsic-size:760px] [content-visibility:auto]">
      <SectionHeader title="Popular Games" href="/games?sort=rated" icon="popular" />
      <GameGrid loading />
    </section>
  );
}

function SectionHeader({ title, href, icon }: { title: string; href: string; icon?: GameIconType }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="flex items-center gap-2 text-xl font-extrabold text-white">
        {icon && <GameIcon type={icon} size={21} />}
        {title}
      </h2>
      <Link href={href} className="flex items-center gap-1 text-sm font-bold text-[#A8A8A8] transition-colors hover:text-white">
        See all <ChevronRight size={16} className="text-[#6C5CFF]" />
      </Link>
    </div>
  );
}
