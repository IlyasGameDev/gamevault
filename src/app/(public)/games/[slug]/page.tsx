import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import type { ReactNode } from 'react';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { GameWithCategories } from '@/lib/types/database';
import GamePlayer from '@/components/games/GamePlayer';
import BackToGameButton from '@/components/games/BackToGameButton';
import GameComments from '@/components/games/GameComments';
import GameActions from '@/components/games/GameActions';
import GameGrid from '@/components/games/GameGrid';
import { SITE_NAME, SITE_URL } from '@/lib/constants';
import Link from 'next/link';
import Image from 'next/image';
import { ExternalLink, Gamepad2 } from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import { getGameSeo } from '@/lib/seo';

export const revalidate = 3600;

async function getGame(slug: string): Promise<GameWithCategories | null> {
  const { data } = await supabaseAdmin
    .from('games')
    .select('*, categories:game_categories(category:categories(*))')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!data) return null;
  return {
    ...data,
    categories: ((data.categories as { category: unknown }[]) ?? []).map((gc) => gc.category),
  } as GameWithCategories;
}

async function getRelated(game: GameWithCategories): Promise<GameWithCategories[]> {
  const categoryIds = new Set(game.categories.map((category) => category.id));
  const catId = game.categories[0]?.id;
  const { data } = await supabaseAdmin
    .from('games')
    .select('*, categories:game_categories(category:categories(*))')
    .eq('status', 'published')
    .neq('id', game.id)
    .order('play_count', { ascending: false })
    .limit(18);

  const games = ((data ?? []).map((g: Record<string, unknown>) => ({
    ...g,
    categories: ((g.categories as { category: unknown }[]) ?? []).map((gc) => gc.category),
  })) as GameWithCategories[]);

  if (!catId) return games.slice(0, 10);

  const sameCategory = games.filter((g) => g.categories.some((c) => categoryIds.has(c.id)));
  const fallback = games.filter((g) => !sameCategory.some((match) => match.id === g.id));

  return [...sameCategory, ...fallback].slice(0, 10);
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const game = await getGame(slug);
  if (!game) return { title: 'Game Not Found' };
  const seo = getGameSeo(game);

  return {
    title: seo.title,
    description: seo.description,
    alternates: {
      canonical: `/games/${game.slug}`,
    },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: `/games/${game.slug}`,
      images: game.thumbnail_url ? [game.thumbnail_url] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
      images: game.thumbnail_url ? [game.thumbnail_url] : [],
    },
  };
}

export default async function GamePage({ params }: Props) {
  const { slug } = await params;
  const game = await getGame(slug);
  if (!game) notFound();

  const related = await getRelated(game);
  const seo = getGameSeo(game);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: game.title,
    url: `${SITE_URL}/games/${game.slug}`,
    image: game.thumbnail_url ?? undefined,
    description: seo.description,
    author: game.developer ? { '@type': 'Organization', name: game.developer } : undefined,
    genre: game.categories.map((c) => c.name),
    gamePlatform: 'Web browser',
    operatingSystem: 'Web browser',
    applicationCategory: 'Game',
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
    },
    aggregateRating: game.rating_count > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: game.rating_avg,
      ratingCount: game.rating_count,
      bestRating: 5,
      worstRating: 1,
    } : undefined,
  };
  const primaryCategory = game.categories[0];
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Games',
        item: `${SITE_URL}/games`,
      },
      ...(primaryCategory ? [{
        '@type': 'ListItem',
        position: 2,
        name: primaryCategory.name,
        item: `${SITE_URL}/categories/${primaryCategory.slug}`,
      }] : []),
      {
        '@type': 'ListItem',
        position: primaryCategory ? 3 : 2,
        name: game.title,
        item: `${SITE_URL}/games/${game.slug}`,
      },
    ],
  };

  return (
    <main className="min-h-screen bg-[#10101B]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <div className="mx-auto max-w-[1580px] space-y-5 px-3 py-3 sm:px-4 sm:py-4">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <section id="game-player" className="min-w-0 scroll-mt-20">
            <GamePlayer game={game} />
          </section>

          {related.length > 0 && (
            <aside className="hidden min-w-0 xl:block">
              <div className="sticky top-[76px] max-h-[calc(100vh-92px)] overflow-y-auto pr-1">
                <h2 className="mb-3 text-xl font-black text-white">Play next</h2>
                <div className="grid grid-cols-2 gap-2.5">
                  {related.map((relatedGame) => (
                    <PlayNextCard key={relatedGame.id} game={relatedGame} />
                  ))}
                </div>
              </div>
            </aside>
          )}
        </div>

        <GameSummaryPanel game={game} seo={seo} />
        <GameDescriptionPanel seo={seo} />

        {related.length > 0 && (
          <section className="space-y-3 xl:hidden">
            <h2 className="text-lg font-black text-white">Play next</h2>
            <GameGrid games={related.slice(0, 6)} />
          </section>
        )}

        <section className="rounded-lg border border-[#252439] bg-[#151522] p-4 sm:p-5">
          <GameComments gameId={game.id} />
        </section>
      </div>
      <BackToGameButton />
    </main>
  );
}

function GameSummaryPanel({ game, seo }: { game: GameWithCategories; seo: ReturnType<typeof getGameSeo> }) {
  const tags = uniqueLabels([
    ...game.categories.map((category) => category.name),
    ...game.tags,
  ]).slice(0, 10);

  return (
    <section className="grid grid-cols-1 overflow-hidden rounded-lg border border-[#24243A] bg-[#151522] lg:grid-cols-[minmax(0,1fr)_420px]">
      <div className="min-w-0 space-y-5 p-5 sm:p-7">
        <nav className="flex min-w-0 flex-wrap items-center gap-1 text-sm font-black text-[#A996FF] sm:text-base" aria-label="Game categories">
          <Link href="/games" className="hover:text-white">Games</Link>
          {game.categories.map((category) => (
            <span key={category.id} className="contents">
              <span className="text-[#77758F]">»</span>
              <Link href={`/categories/${category.slug}`} className="hover:text-white">{category.name}</Link>
            </span>
          ))}
          <span className="text-[#77758F]">»</span>
          <span className="truncate text-[#C8C0FF]">{game.title}</span>
        </nav>

        <div className="space-y-4">
          <h1 className="text-3xl font-black text-white sm:text-4xl">{seo.h1}</h1>
          <GameActions game={game} variant="share" />
          <p className="max-w-4xl text-base leading-7 text-[#CAC7DA] sm:text-lg">{seo.intro}</p>
        </div>

        <dl className="space-y-3 text-base sm:text-lg">
          {game.developer && (
            <InfoRow label="Developer">
              {game.developer_url ? (
                <a href={game.developer_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-black text-[#A996FF] hover:text-white">
                  {game.developer} <ExternalLink size={14} />
                </a>
              ) : (
                <span className="font-black text-[#A996FF]">{game.developer}</span>
              )}
            </InfoRow>
          )}
          <InfoRow label="Rating">
            {game.rating_count > 0 ? (
              <span><strong className="text-white">{game.rating_avg.toFixed(1)}</strong> <span className="text-sm text-[#D8D6E8]">({formatNumber(game.rating_count)} votes)</span></span>
            ) : (
              <span className="text-[#D8D6E8]">Not rated yet</span>
            )}
          </InfoRow>
          {game.published_at && <InfoRow label="Released">{formatRelease(game.published_at)}</InfoRow>}
          <InfoRow label="Technology">HTML5</InfoRow>
          <InfoRow label="Platforms">Browser (desktop, mobile, tablet)</InfoRow>
        </dl>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                key={tag}
                href={game.categories.some((category) => category.name === tag) ? `/categories/${game.categories.find((category) => category.name === tag)?.slug}` : `/search?q=${encodeURIComponent(tag)}`}
                className="rounded-lg bg-[#282743] px-4 py-2 text-base font-black text-[#AFA6FF] transition-colors hover:bg-[#353354] hover:text-white"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="hidden border-l border-[#24243A] p-5 lg:block">
        <div className="h-full min-h-[300px] rounded-none border border-[#2C2B42] bg-[#171725]" aria-hidden="true" />
      </div>
    </section>
  );
}

function GameDescriptionPanel({ seo }: { seo: ReturnType<typeof getGameSeo> }) {
  return (
    <section className="space-y-6 rounded-lg border border-[#24243A] bg-[#151522] p-5 text-[#B8B6C9] sm:p-7">
      <div className="space-y-3">
        <h2 className="text-2xl font-black text-white">{seo.aboutHeading}</h2>
        <p className="max-w-6xl text-base leading-8 sm:text-lg">{seo.aboutBody}</p>
      </div>

      <div className="space-y-3">
        <h2 className="text-2xl font-black text-white">{seo.howToPlayHeading}</h2>
        <p className="max-w-6xl text-base leading-8 sm:text-lg">{seo.howToPlayBody}</p>
      </div>

      <div className="space-y-3">
        <h2 className="text-2xl font-black text-white">{seo.controlsHeading}</h2>
        <ul className="space-y-2 text-base leading-8 sm:text-lg">
          {seo.controlItems.map((item) => (
            <li key={item} className="flex gap-3">
              <span className="mt-3 h-2 w-2 shrink-0 rounded-full bg-[#A996FF]" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-3">
        <h2 className="text-2xl font-black text-white">{seo.whyHeading}</h2>
        <ul className="space-y-2 text-base leading-8 sm:text-lg">
          {seo.whyPlayItems.map((item) => (
            <li key={item} className="flex gap-3">
              <span className="mt-3 h-2 w-2 shrink-0 rounded-full bg-[#A996FF]" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-3">
      <dt className="text-[#858399]">{label}:</dt>
      <dd className="min-w-0 font-bold text-[#E8E6F2]">{children}</dd>
    </div>
  );
}

function uniqueLabels(labels: string[]) {
  return labels.filter((label, index, all) => label && all.findIndex((candidate) => candidate.toLowerCase() === label.toLowerCase()) === index);
}

function formatRelease(date: string) {
  return new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(new Date(date));
}

function PlayNextCard({ game }: { game: GameWithCategories }) {
  return (
    <Link
      href={`/games/${game.slug}`}
      className="group relative block aspect-[16/9] overflow-hidden rounded-lg bg-[#202035] outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[#9B8CFF]"
      aria-label={`Play ${game.title}`}
      title={game.title}
    >
      {game.thumbnail_url ? (
        <Image
          src={game.thumbnail_url}
          alt={game.title}
          fill
          unoptimized
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="170px"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <Gamepad2 size={30} className="text-[#9B8CFF]" />
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
        <p className="truncate text-xs font-black text-white">{game.title}</p>
      </div>
    </Link>
  );
}
