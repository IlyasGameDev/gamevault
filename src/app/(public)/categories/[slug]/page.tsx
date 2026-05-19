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
  if (games.length === 0) notFound();
  const seo = getCategorySeo(cat);
  const guideItems = getCategoryGuideItems(cat.name, games.length);
  const contentSections = getCategoryContentSections(cat.slug);

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

      <section className="grid gap-4 rounded-2xl border border-[#252525] bg-[#161616] p-5 sm:grid-cols-3 sm:p-6">
        {guideItems.map((item) => (
          <div key={item.title} className="space-y-2">
            <h2 className="text-lg font-extrabold text-white">{item.title}</h2>
            <p className="text-sm leading-6 text-[#B9B9C8]">{item.body}</p>
          </div>
        ))}
      </section>

      {contentSections.length > 0 && (
        <section className="grid gap-4 md:grid-cols-3">
          {contentSections.map((section) => (
            <article key={section.title} className="rounded-2xl border border-[#252525] bg-[#141414] p-5">
              <h2 className="text-xl font-extrabold text-white">{section.title}</h2>
              <p className="mt-3 text-sm leading-6 text-[#C9C9D4]">{section.body}</p>
              {section.href && (
                <Link href={section.href} className="mt-4 inline-flex text-sm font-bold text-[#A996FF] hover:text-white">
                  {section.linkLabel}
                </Link>
              )}
            </article>
          ))}
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-2xl font-extrabold text-white">Top {cat.name} Games</h2>
        <GameGrid games={games} />
      </section>
    </main>
  );
}

function getCategoryContentSections(slug: string) {
  if (slug !== 'puzzle') return [];

  return [
    {
      title: 'Puzzle Games With No Download',
      body: 'Open a game and play in the browser. That is the whole idea here: no app store, no launcher, no waiting around for a huge install before you can make the first move.',
      href: '/categories/puzzle',
      linkLabel: 'Browse no-download puzzle games',
    },
    {
      title: 'Sorting, Matching, and Logic',
      body: 'Some puzzles are calm and tidy. Others get messy fast. Try color sorting, tile matching, hidden-object games, number puzzles, and simple logic games until one clicks.',
    },
    {
      title: 'Good for Quick Breaks',
      body: 'Most of these games are easy to start, but they still give your brain something to chew on. Play one round during a break or settle in and keep improving your route.',
    },
  ];
}

function getCategoryGuideItems(categoryName: string, gameCount: number) {
  const lowerName = categoryName.toLowerCase();

  return [
    {
      title: `Choosing ${categoryName} Games`,
      body: `Start with the first few ${lowerName} games that match your mood, then compare controls, thumbnail style, and tags before opening a longer session.`,
    },
    {
      title: 'What to Expect',
      body: `This category currently includes ${gameCount.toLocaleString()} playable browser games, with each page showing controls, platform notes, related games, and quick tips.`,
    },
    {
      title: 'Best Way to Play',
      body: 'Use fullscreen for games with small targets or fast movement, and try desktop controls when a game needs precise timing or repeated keyboard input.',
    },
  ];
}
