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
import { SITE_NAME } from '@/lib/constants';

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
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* Player */}
      <div className="max-w-4xl mx-auto">
        <GamePlayer game={game} />
      </div>

      {/* Info + Rating */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <GameInfo game={game} />
          <GameActions game={game} />
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Rate this game</h3>
            <GameRating game={game} />
          </div>
          <GameComments gameId={game.id} />
        </div>
        <aside className="space-y-4">
          <div className="bg-[#1a1d2e] rounded-xl p-4 border border-white/5 text-sm space-y-3">
            <h3 className="font-semibold text-white">Game Info</h3>
            <dl className="space-y-2 text-gray-500">
              <div className="flex justify-between"><dt>Type</dt><dd className="text-gray-300 capitalize">{game.game_type}</dd></div>
              <div className="flex justify-between"><dt>Size</dt><dd className="text-gray-300">{game.width} × {game.height}</dd></div>
              <div className="flex justify-between"><dt>Plays</dt><dd className="text-gray-300">{game.play_count.toLocaleString()}</dd></div>
              {game.developer && <div className="flex justify-between"><dt>Developer</dt><dd className="text-gray-300 truncate max-w-[120px]">{game.developer}</dd></div>}
            </dl>
          </div>
        </aside>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="max-w-4xl mx-auto space-y-4">
          <h2 className="text-lg font-bold text-white">More Games Like This</h2>
          <GameGrid games={related} />
        </section>
      )}
    </main>
  );
}
