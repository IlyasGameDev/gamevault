import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { Category, GameWithCategories } from '@/lib/types/database';
import GameGrid from '@/components/games/GameGrid';
import { getCategorySeo } from '@/lib/seo';

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
  if (!cat) return {};

  const seo = getCategorySeo(cat);

  return {
    title: seo.title,
    description: seo.description,
    alternates: {
      canonical: `/categories/${cat.slug}`,
    },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: `/categories/${cat.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const cat = await getCategory(slug);

  if (!cat) notFound();

  const games = await getCategoryGames(cat.id);
  const seo = getCategorySeo(cat);

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
      <nav className="flex items-center gap-2 text-sm text-[#A8A8A8]">
        <Link href="/" className="hover:text-white">Home</Link>
        <ChevronRight size={14} />
        <Link href="/categories" className="hover:text-white">Categories</Link>
        <ChevronRight size={14} />
        <span className="text-gray-300">{cat.name}</span>
      </nav>

      <div className="flex items-center gap-4">
        <span className="text-5xl">{cat.icon}</span>
        <div className="max-w-4xl space-y-3">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#A996FF]">{cat.name} category</p>
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">{seo.title}</h1>
          <p className="text-[#A8A8A8]">{games.length} games</p>
          <p className="text-base leading-7 text-[#D8D8D8]">{seo.intro}</p>
          <p className="text-base leading-7 text-[#B9B9C8]">{seo.secondary}</p>
          {cat.description && <p className="text-sm text-[#A8A8A8]">{cat.description}</p>}
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-extrabold text-white">Top {cat.name} Games</h2>
        <GameGrid games={games} />
      </section>
    </main>
  );
}
