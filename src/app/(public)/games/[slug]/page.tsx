import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { GameWithCategories } from '@/lib/types/database';
import GamePlayer from '@/components/games/GamePlayer';
import GameInfo from '@/components/games/GameInfo';
import GameRating from '@/components/games/GameRating';
import GameComments from '@/components/games/GameComments';
import GameActions from '@/components/games/GameActions';
import GameGrid from '@/components/games/GameGrid';
import GameCard from '@/components/games/GameCard';
import { SITE_NAME } from '@/lib/constants';
import Badge from '@/components/ui/Badge';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { formatDate } from '@/lib/utils';

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
  if (!game.categories.length) return [];
  const catId = game.categories[0].id;
  const { data } = await supabaseAdmin
    .from('games')
    .select('*, categories:game_categories(category:categories(*))')
    .eq('status', 'published')
    .neq('id', game.id)
    .limit(6);

  return ((data ?? []).map((g: Record<string, unknown>) => ({
    ...g,
    categories: ((g.categories as { category: unknown }[]) ?? []).map((gc) => gc.category),
  })) as GameWithCategories[]).filter((g) =>
    g.categories.some((c) => c.id === catId)
  ).slice(0, 6);
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const game = await getGame(slug);
  if (!game) return { title: 'Game Not Found' };
  return {
    title: `${game.title} — ${SITE_NAME}`,
    description: game.description ?? `Play ${game.title} for free on ${SITE_NAME}`,
    openGraph: {
      images: game.thumbnail_url ? [game.thumbnail_url] : [],
    },
  };
}

export default async function GamePage({ params }: Props) {
  const { slug } = await params;
  const game = await getGame(slug);
  if (!game) notFound();

  const related = await getRelated(game);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: game.title,
    description: game.description ?? undefined,
    image: game.thumbnail_url ?? undefined,
    author: game.developer ? { '@type': 'Organization', name: game.developer } : undefined,
    genre: game.categories.map((c) => c.name),
    aggregateRating: game.rating_count > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: game.rating_avg,
      ratingCount: game.rating_count,
      bestRating: 5,
      worstRating: 1,
    } : undefined,
  };

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 sm:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {game.categories.map((cat) => (
            <Link key={cat.id} href={`/categories/${cat.slug}`}>
              <Badge variant="blue" className="cursor-pointer font-bold hover:opacity-80">{cat.name}</Badge>
            </Link>
          ))}
        </div>
        <h1 className="text-3xl font-extrabold text-white sm:text-4xl">{game.title}</h1>
        <div className="flex flex-wrap items-center gap-3 text-sm text-[#A8A8A8]">
          {game.developer && (
            <span>
              By{' '}
              {game.developer_url ? (
                <a href={game.developer_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-white hover:text-[#9B8CFF]">
                  {game.developer} <ExternalLink size={12} />
                </a>
              ) : (
                <span className="font-semibold text-white">{game.developer}</span>
              )}
            </span>
          )}
          {game.published_at && <span>Released {formatDate(game.published_at)}</span>}
          <span>{game.play_count.toLocaleString()} plays</span>
          {game.rating_count > 0 && <span>{game.rating_avg.toFixed(1)} rating</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <GamePlayer game={game} />
          <GameActions game={game} />
          <GameInfo game={game} />
          <div className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-5">
            <h3 className="mb-3 text-sm font-extrabold uppercase text-[#A8A8A8]">Rate this game</h3>
            <GameRating game={game} />
          </div>
          <GameComments gameId={game.id} />
        </div>

        <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <div className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-5 text-sm">
            <h2 className="font-extrabold text-white">Game Info</h2>
            <dl className="mt-4 space-y-3 text-[#A8A8A8]">
              <div className="flex justify-between gap-4"><dt>Type</dt><dd className="text-right font-semibold capitalize text-white">{game.game_type}</dd></div>
              <div className="flex justify-between gap-4"><dt>Player</dt><dd className="text-right font-semibold text-white">{game.width} x {game.height}</dd></div>
              <div className="flex justify-between gap-4"><dt>Plays</dt><dd className="text-right font-semibold text-white">{game.play_count.toLocaleString()}</dd></div>
              {game.developer && <div className="flex justify-between gap-4"><dt>Developer</dt><dd className="max-w-[150px] truncate text-right font-semibold text-white">{game.developer}</dd></div>}
            </dl>
          </div>

          {related.length > 0 && (
            <section className="hidden space-y-3 xl:block">
              <h2 className="font-extrabold text-white">Similar games</h2>
              <div className="space-y-3">
                {related.slice(0, 4).map((relatedGame) => (
                  <GameCard key={relatedGame.id} game={relatedGame} />
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>

      {related.length > 0 && (
        <section className="space-y-4 xl:hidden">
          <h2 className="text-lg font-extrabold text-white">More Games Like This</h2>
          <GameGrid games={related} />
        </section>
      )}
    </main>
  );
}
