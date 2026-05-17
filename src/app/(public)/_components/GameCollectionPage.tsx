import type { Metadata } from 'next';
import GameGrid from '@/components/games/GameGrid';
import GameIcon, { GameIconType } from '@/components/ui/GameIcon';
import { getHomepageGames } from '@/lib/games';

type CollectionSort = 'newest' | 'popular' | 'rated';

export type GameCollectionConfig = {
  title: string;
  description: string;
  canonical: string;
  intro: string;
  secondary: string;
  sort: CollectionSort;
  icon: GameIconType;
};

export function createCollectionMetadata(config: GameCollectionConfig): Metadata {
  return {
    title: config.title,
    description: config.description,
    alternates: {
      canonical: config.canonical,
    },
    openGraph: {
      title: config.title,
      description: config.description,
      url: config.canonical,
    },
    twitter: {
      card: 'summary_large_image',
      title: config.title,
      description: config.description,
    },
  };
}

export default async function GameCollectionPage({ config }: { config: GameCollectionConfig }) {
  const games = await getHomepageGames(config.sort, 24);

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
      <section className="rounded-3xl border border-[#252525] bg-[#161616] px-5 py-6 sm:px-8 sm:py-8">
        <div className="max-w-4xl space-y-4">
          <h1 className="flex items-center gap-3 text-3xl font-black text-white sm:text-4xl">
            <GameIcon type={config.icon} size={30} />
            {config.title}
          </h1>
          <p className="text-base leading-7 text-[#D8D8D8] sm:text-lg">{config.intro}</p>
          <p className="text-base leading-7 text-[#B8B8B8] sm:text-lg">{config.secondary}</p>
        </div>
      </section>

      <GameGrid games={games} />
    </main>
  );
}
