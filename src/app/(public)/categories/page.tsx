import Link from 'next/link';
import { getCategoriesWithPublishedGames } from '@/lib/categories';
import GameIcon from '@/components/ui/GameIcon';

export const metadata = { title: 'Categories — YoPlayables' };
export const revalidate = 3600;

export default async function CategoriesPage() {
  const categories = await getCategoriesWithPublishedGames();

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-extrabold text-white">All Categories</h1>
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
