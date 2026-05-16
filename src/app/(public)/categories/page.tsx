import Link from 'next/link';
import type { Metadata } from 'next';
import { getCategoriesWithPublishedGames } from '@/lib/categories';
import GameIcon from '@/components/ui/GameIcon';

export const metadata: Metadata = {
  title: 'Browse Game Categories',
  description: 'Browse game categories on YoPlayables and discover free browser games across action, puzzle, racing, sports, multiplayer, and more.',
  alternates: {
    canonical: '/categories',
  },
};
export const revalidate = 3600;

export default async function CategoriesPage() {
  const categories = await getCategoriesWithPublishedGames();

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
      <section className="space-y-4 rounded-3xl border border-[#252525] bg-[#161616] px-5 py-6 sm:px-7 sm:py-7">
        <h1 className="text-3xl font-extrabold text-white sm:text-4xl">Browse Free Game Categories</h1>
        <p className="max-w-4xl text-base leading-7 text-[#D8D8D8] sm:text-lg">
          Explore free online game categories on YoPlayables and find browser games that match the way you like to play. From action, puzzle, and racing games to sports, multiplayer, cooking, and clicker games, every category is built to help you find something worth playing fast.
        </p>
        <p className="max-w-4xl text-base leading-7 text-[#B9B9C8] sm:text-lg">
          Choose a category to discover HTML5 and WebGL games that run instantly on desktop, tablet, and mobile with no download required. Whether you want a quick arcade challenge or a longer puzzle session, browsing by category is the easiest way to find the right game.
        </p>
      </section>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/categories/${cat.slug}`}
            className="group flex flex-col items-center gap-3 rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-6 transition-all hover:-translate-y-0.5 hover:border-[#6C5CFF]/70 hover:shadow-xl hover:shadow-black/30"
          >
            <GameIcon type={cat.slug} size={34} className="text-[#9B8CFF]" />
            <div className="text-center">
              <p className="font-bold text-white transition-colors group-hover:text-[#9B8CFF]">{cat.name}</p>
              {cat.description && <p className="mt-1 line-clamp-2 text-xs text-[#A8A8A8]">{cat.description}</p>}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
