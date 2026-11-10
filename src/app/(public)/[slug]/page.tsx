import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import GameGrid from '@/components/games/GameGrid';
import GameIcon from '@/components/ui/GameIcon';
import { getCategoriesWithPublishedGames } from '@/lib/categories';
import { gameFacts, supplierRecords } from '@/lib/gameFacts';
import { getLandingPageConfig, LANDING_PAGE_CONFIGS } from '@/lib/seo';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { GameWithCategories } from '@/lib/types/database';

export const revalidate = 3600;

type Props = {
  params: Promise<{ slug: string }>;
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

  const local = slug === 'free-2-player-games';
  const records = supplierRecords.filter((entry) => local ? !!entry.localControls : entry.mobile);
  const [categories, result] = await Promise.all([
    getCategoriesWithPublishedGames(12),
    supabaseAdmin.from('games').select('*, categories:game_categories(category:categories(*))')
      .eq('status', 'published').in('slug', records.map((entry) => entry.slug)).order('title'),
  ]);
  if (result.error) throw result.error;
  const picks = result.data.map((game) => ({
    ...game,
    categories: game.categories.map((entry: { category: unknown }) => entry.category),
  }) as GameWithCategories).filter((game) => {
    const record = gameFacts(game).record;
    return record && (local ? !!record.localControls : record.mobile);
  });

  return (
    <main className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6">
      <section className="rounded-3xl border border-[#2A2A2A] bg-[#171717] px-6 py-8 sm:px-8 sm:py-10">
        <div className="max-w-4xl space-y-4">
          <h1 className="text-3xl font-black text-white sm:text-4xl">{config.title}</h1>
          <p className="text-base leading-7 text-[#D8D8D8] sm:text-lg">{config.intro}</p>
          <p className="text-base leading-7 text-[#B8B8B8] sm:text-lg">{config.secondary}</p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-extrabold text-white">{local ? 'Play together on one device' : 'Games with mobile support'}</h2>
        <GameGrid games={picks} />
        {local && <ul className="space-y-3 text-[#D8D8D8]">{picks.map((game) => (
          <li key={game.id}><Link className="font-bold text-[#BDB5FF]" href={`/games/${game.slug}`}>{game.title}</Link>
            {' · '}{gameFacts(game).record?.localControls}</li>
        ))}</ul>}
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

    </main>
  );
}
