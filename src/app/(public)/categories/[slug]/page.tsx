import { cache } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { GAMES_PER_PAGE } from '@/lib/constants';
import { getPublishedGamesPage } from '@/lib/games';
import { getCategorySeo } from '@/lib/seo';
import GameGrid from '@/components/games/GameGrid';

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string }> };

const categoryPage = cache(async (slug: string, rawPage?: string) => {
  const page = rawPage === undefined ? 1 : Number(rawPage);
  if (!Number.isSafeInteger(page) || page < 1 || page > Number.MAX_SAFE_INTEGER / GAMES_PER_PAGE ||
      (rawPage !== undefined && rawPage !== String(page))) notFound();

  const { data: category, error } = await supabaseAdmin.from('categories').select('*').eq('slug', slug).maybeSingle();
  if (error) throw error;
  if (!category) notFound();
  const { games, count } = await getPublishedGamesPage({ page, category: slug, sort: 'alpha' });
  if (!games.length) notFound();
  return { page, games, count, category, seo: getCategorySeo(category) };
});

function categoryHref(slug: string, page: number) {
  return `/categories/${slug}${page === 1 ? '' : `?page=${page}`}`;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { page, seo } = await categoryPage(slug, (await searchParams).page);
  const title = page === 1 ? seo.title : `${seo.title} – Page ${page}`;
  const url = categoryHref(slug, page);
  return { title, description: seo.description, alternates: { canonical: url },
    openGraph: { title, description: seo.description, url } };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { games, count, category, page, seo } = await categoryPage(slug, (await searchParams).page);
  const pages = Math.ceil(count / GAMES_PER_PAGE);
  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
      <nav aria-label="Breadcrumb" className="flex gap-3 text-sm text-[#A8A8A8]">
        <Link href="/">Home</Link> / <Link href="/categories">Categories</Link> / {category.name}
      </nav>
      <header className="max-w-4xl space-y-3">
        <h1 className="text-3xl font-extrabold text-white sm:text-4xl">{seo.title}{page > 1 && ` – Page ${page}`}</h1>
        <p className="text-[#A8A8A8]">{count.toLocaleString()} games · Page {page} of {pages}</p>
        {page === 1 && <p className="leading-7 text-[#D8D8D8]">{seo.intro}</p>}
        {page === 1 && slug === 'puzzle' && (
          <nav aria-label="Puzzle picks" className="flex gap-4 text-[#BDB5FF]">
            <Link href="/games/ball-sort-master-3d">Color sorting</Link>
            <Link href="/games/shape-fear-andamp-fun">Shape matching</Link>
            <Link href="/games/obby-jigsaw">Jigsaw puzzles</Link>
          </nav>
        )}
      </header>
      <GameGrid games={games} />
      {pages > 1 && <nav aria-label="Category pages" className="flex justify-center gap-5 font-bold text-[#BDB5FF]">
        {page > 1 && <Link href={categoryHref(slug, page - 1)}>Previous page</Link>}
        {page < pages && <Link href={categoryHref(slug, page + 1)}>Next page</Link>}
      </nav>}
    </main>
  );
}
