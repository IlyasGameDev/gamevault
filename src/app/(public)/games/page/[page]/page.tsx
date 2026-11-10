import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import GameGrid from '@/components/games/GameGrid';
import { archiveHref, archiveSort, GAMES_PER_PAGE, type SortOption } from '@/lib/constants';
import { getPublishedGamesPage } from '@/lib/games';

export const revalidate = 3600;

type Props = {
  params: Promise<{ page: string }>;
  searchParams: Promise<{ sort?: string }>;
};

function parsePage(value: string) {
  const page = Number(value);
  return /^[1-9]\d*$/.test(value) && Number.isSafeInteger(page) && page <= Math.floor(Number.MAX_SAFE_INTEGER / GAMES_PER_PAGE) ? page : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const parsedPage = parsePage((await params).page);
  if (!parsedPage) return {};

  return {
    title: `Browse Games - Page ${parsedPage}`,
    description: `Browse page ${parsedPage} of free online browser games on YoPlayables. Find instant-play games for desktop, tablet, and mobile with no download required.`,
    alternates: {
      canonical: `/games/page/${parsedPage}`,
    },
    openGraph: {
      title: `Browse Games - Page ${parsedPage}`,
      description: `Browse page ${parsedPage} of free online browser games on YoPlayables.`,
      url: `/games/page/${parsedPage}`,
    },
  };
}

export default async function GamesArchivePage({ params, searchParams }: Props) {
  const parsedPage = parsePage((await params).page);
  if (!parsedPage) notFound();
  const sort = archiveSort((await searchParams).sort);
  if (parsedPage === 1) redirect(archiveHref(1, sort));

  const { games, count } = await getPublishedGamesPage({ page: parsedPage, limit: GAMES_PER_PAGE, sort });
  const pageCount = Math.ceil(count / GAMES_PER_PAGE);

  if (parsedPage > pageCount || games.length === 0) notFound();

  return (
    <main className="mx-auto max-w-7xl space-y-7 px-4 py-8 sm:px-6">
      <section className="space-y-3 rounded-3xl border border-[#252525] bg-[#161616] px-5 py-6 sm:px-8 sm:py-8">
        <nav className="text-sm font-bold text-[#A8A8A8]" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-white">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/games" className="hover:text-white">Games</Link>
          <span className="mx-2">/</span>
          <span>Page {parsedPage}</span>
        </nav>
        <h1 className="text-3xl font-black text-white sm:text-4xl">Browse Free Online Games - Page {parsedPage}</h1>
        <p className="max-w-4xl text-base leading-7 text-[#D8D8D8]">
          Choose a game to open its player and controls.
        </p>
        <p className="text-sm font-bold text-[#A8A8A8]">
          Showing {(parsedPage - 1) * GAMES_PER_PAGE + 1}-{(parsedPage - 1) * GAMES_PER_PAGE + games.length} of {count.toLocaleString()} games
        </p>
      </section>

      <GameGrid games={games} />
      <ArchivePagination page={parsedPage} pageCount={pageCount} sort={sort} />
    </main>
  );
}

function ArchivePagination({ page, pageCount, sort }: { page: number; pageCount: number; sort: SortOption }) {
  const start = Math.max(1, page - 3);
  const end = Math.min(pageCount, start + 6);
  const pages = Array.from({ length: end - start + 1 }, (_, index) => start + index);

  return (
    <nav className="flex flex-wrap items-center justify-center gap-2" aria-label="Game archive pagination">
      <PageLink href={archiveHref(Math.max(1, page - 1), sort)} disabled={page <= 1} label="Previous">
        <ChevronLeft size={16} />
        Previous
      </PageLink>

      {pages.map((pageNumber) => (
        <PageLink
          key={pageNumber}
          href={archiveHref(pageNumber, sort)}
          active={pageNumber === page}
          label={`Page ${pageNumber}`}
        >
          {pageNumber}
        </PageLink>
      ))}

      <PageLink href={archiveHref(page + 1, sort)} disabled={page >= pageCount} label="Next">
        Next
        <ChevronRight size={16} />
      </PageLink>
    </nav>
  );
}

function PageLink({
  href,
  children,
  active = false,
  disabled = false,
  label,
}: {
  href: string;
  children: ReactNode;
  active?: boolean;
  disabled?: boolean;
  label: string;
}) {
  if (disabled) {
    return (
      <span className="inline-flex h-10 items-center gap-2 rounded-full border border-[#24243A] px-4 text-sm font-black text-[#66647A]">
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      className={`inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-black transition-colors ${
        active
          ? 'border-[#6C5CFF] bg-[#6C5CFF] text-white'
          : 'border-[#2A2A2A] bg-[#151522] text-[#D8D8E8] hover:border-[#6C5CFF]/70 hover:text-white'
      }`}
    >
      {children}
    </Link>
  );
}
