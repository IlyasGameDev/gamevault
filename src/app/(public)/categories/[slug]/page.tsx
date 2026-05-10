import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { Category, GameWithCategories } from '@/lib/types/database';
import GameGrid from '@/components/games/GameGrid';

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

async function getCategory(slug: string): Promise<Category | null> {
  const { data } = await supabaseAdmin.from('categories').select('*').eq('slug', slug).single();
  return data ?? null;
}

async function getCategoryGames(categoryId: string): Promise<GameWithCategories[]> {
  const { data } = await supabaseAdmin
    .from('game_categories')
    .select('game:games(*, categories:game_categories(category:categories(*)))')
    .eq('category_id', categoryId);

  return ((data ?? [])
    .map((d: Record<string, unknown>) => d.game)
    .filter((g): g is Record<string, unknown> => !!g && (g as Record<string, unknown>).status === 'published')
    .map((g) => ({
      ...g,
      categories: ((g.categories as { category: unknown }[]) ?? []).map((gc) => gc.category),
    }))) as GameWithCategories[];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = await getCategory(slug);
  return cat ? { title: `${cat.name} Games — GameVault` } : {};
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const [cat, games] = await Promise.all([getCategory(slug), (async () => {
    const c = await getCategory(slug);
    return c ? getCategoryGames(c.id) : [];
  })()]);

  if (!cat) notFound();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-white">Home</Link>
        <ChevronRight size={14} />
        <Link href="/categories" className="hover:text-white">Categories</Link>
        <ChevronRight size={14} />
        <span className="text-gray-300">{cat.name}</span>
      </nav>

      {/* Header */}
      <div className="flex items-center gap-4">
        <span className="text-5xl">{cat.icon}</span>
        <div>
          <h1 className="text-3xl font-bold text-white">{cat.name}</h1>
          <p className="text-gray-500 mt-1">{games.length} games</p>
          {cat.description && <p className="text-gray-400 text-sm mt-1">{cat.description}</p>}
        </div>
      </div>

      <GameGrid games={games} />
    </main>
  );
}
