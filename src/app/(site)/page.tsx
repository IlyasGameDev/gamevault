import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase/admin';
import FeaturedCarousel from '@/components/games/FeaturedCarousel';
import GameGrid from '@/components/games/GameGrid';
import { GameWithCategories, Category } from '@/lib/types/database';
import { ChevronRight } from 'lucide-react';

async function getFeatured(): Promise<GameWithCategories[]> {
  const { data } = await supabaseAdmin
    .from('games')
    .select('*, categories:game_categories(category:categories(*))')
    .eq('status', 'published')
    .eq('is_featured', true)
    .limit(5);
  return ((data ?? []).map((g: Record<string, unknown>) => ({
    ...g,
    categories: ((g.categories as { category: unknown }[]) ?? []).map((gc) => gc.category),
  }))) as GameWithCategories[];
}

async function getGames(sort: string, limit: number): Promise<GameWithCategories[]> {
  let query = supabaseAdmin
    .from('games')
    .select('*, categories:game_categories(category:categories(*))')
    .eq('status', 'published')
    .limit(limit);

  if (sort === 'popular') query = query.order('play_count', { ascending: false });
  else if (sort === 'rated') query = query.order('rating_avg', { ascending: false });
  else query = query.order('published_at', { ascending: false });

  const { data } = await query;
  return ((data ?? []).map((g: Record<string, unknown>) => ({
    ...g,
    categories: ((g.categories as { category: unknown }[]) ?? []).map((gc) => gc.category),
  }))) as GameWithCategories[];
}

async function getCategories(): Promise<Category[]> {
  const { data } = await supabaseAdmin.from('categories').select('*').order('display_order');
  return data ?? [];
}

export default async function HomePage() {
  const [featured, trending, newest, topRated, categories] = await Promise.all([
    getFeatured(),
    getGames('popular', 8),
    getGames('newest', 8),
    getGames('rated', 8),
    getCategories(),
  ]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-16">
      {featured.length > 0 && (
        <section>
          <FeaturedCarousel games={featured} />
        </section>
      )}

      <section className="space-y-4">
        <SectionHeader title="🔥 Trending Now" href="/games?sort=popular" />
        <GameGrid games={trending} />
      </section>

      <section className="space-y-4">
        <SectionHeader title="Browse by Category" href="/categories" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="flex flex-col items-center gap-2 p-4 bg-[#1a1d2e] border border-white/5 rounded-xl hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group"
            >
              <span className="text-3xl">{cat.icon}</span>
              <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader title="✨ New Games" href="/games?sort=newest" />
        <GameGrid games={newest} />
      </section>

      {topRated.length > 0 && (
        <section className="space-y-4">
          <SectionHeader title="⭐ Top Rated" href="/games?sort=rated" />
          <GameGrid games={topRated} />
        </section>
      )}
    </main>
  );
}

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <Link href={href} className="flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
        See all <ChevronRight size={16} />
      </Link>
    </div>
  );
}
