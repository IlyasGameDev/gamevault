import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import GameGrid from '@/components/games/GameGrid';
import GameIcon from '@/components/ui/GameIcon';
import { getCategoriesWithPublishedGames } from '@/lib/categories';
import { getHomepageGames } from '@/lib/games';
import { getLandingPageConfig, LANDING_PAGE_CONFIGS } from '@/lib/seo';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { Category, GameWithCategories } from '@/lib/types/database';

export const revalidate = 3600;

type Props = {
  params: Promise<{ slug: string }>;
};

type CategoryLandingBundle = {
  category: Category;
  games: GameWithCategories[];
};

export async function generateStaticParams() {
  return Object.keys(LANDING_PAGE_CONFIGS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const config = getLandingPageConfig(slug);

  if (!config) return {};

  return {
    title: config.title,
    description: config.description,
    alternates: {
      canonical: `/${config.slug}`,
    },
    openGraph: {
      title: config.title,
      description: config.description,
      url: `/${config.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: config.title,
      description: config.description,
    },
  };
}

export default async function LandingPage({ params }: Props) {
  const { slug } = await params;
  const config = getLandingPageConfig(slug);

  if (!config) notFound();

  const [popularGames, categories, categoryBundle] = await Promise.all([
    getHomepageGames('popular', 12),
    getCategoriesWithPublishedGames(12),
    config.categorySlug ? getCategoryLandingBundle(config.categorySlug) : Promise.resolve(null),
  ]);

  return (
    <main className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6">
      <section className="rounded-3xl border border-[#2A2A2A] bg-[#171717] px-6 py-8 sm:px-8 sm:py-10">
        <div className="max-w-4xl space-y-4">
          <h1 className="text-3xl font-black text-white sm:text-4xl">{config.title}</h1>
          <p className="text-base leading-7 text-[#D8D8D8] sm:text-lg">{config.intro}</p>
          <p className="text-base leading-7 text-[#B8B8B8] sm:text-lg">{config.secondary}</p>
        </div>
      </section>

      {categoryBundle && categoryBundle.games.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-extrabold text-white">Top {categoryBundle.category.name} Games</h2>
          <GameGrid games={categoryBundle.games} />
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-2xl font-extrabold text-white">Popular Browser Games</h2>
        <GameGrid games={popularGames} />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-extrabold text-white">Browse by Category</h2>
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="inline-flex items-center gap-2 rounded-full border border-[#2A2A2A] bg-[#1A1A1A] px-4 py-2 text-sm font-bold text-[#D8D8D8] transition-colors hover:border-[#6C5CFF]/70 hover:text-white"
            >
              <GameIcon type={category.slug} size={15} />
              {category.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-[#252525] bg-[#141414] px-6 py-7 sm:px-8">
        <div className="max-w-4xl space-y-3">
          <h2 className="text-2xl font-extrabold text-white">{config.whyTitle}</h2>
          <p className="text-base leading-7 text-[#C9C9C9] sm:text-lg">{config.whyBody}</p>
        </div>
      </section>
    </main>
  );
}

async function getCategoryLandingBundle(slug: string): Promise<CategoryLandingBundle | null> {
  const { data: category } = await supabaseAdmin.from('categories').select('*').eq('slug', slug).single();

  if (!category) return null;

  const { data } = await supabaseAdmin
    .from('game_categories')
    .select('game:games(*, categories:game_categories(category:categories(*)))')
    .eq('category_id', category.id);

  const games = ((data ?? [])
    .map((entry: Record<string, unknown>) => entry.game)
    .filter((game): game is Record<string, unknown> => !!game && (game as Record<string, unknown>).status === 'published')
    .map((game) => ({
      ...game,
      categories: ((game.categories as { category: unknown }[]) ?? []).map((item) => item.category),
    }))) as GameWithCategories[];

  return {
    category,
    games: games.slice(0, 12),
  };
}
