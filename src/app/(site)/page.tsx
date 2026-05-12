import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase/admin';
import HomeHero from '@/components/games/HomeHero';
import HomeHud from '@/components/games/HomeHud';
import HomeSideActions from '@/components/games/HomeSideActions';
import HomeModeDock from '@/components/games/HomeModeDock';
import HomeGameCard from '@/components/games/HomeGameCard';
import HomeAllGamesSection from '@/components/games/HomeAllGamesSection';
import { GameWithCategories, Category } from '@/lib/types/database';
import { Flame, Sparkles, Star, Gamepad2, ChevronRight } from 'lucide-react';

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

async function getTotalGames(): Promise<number> {
  const { count } = await supabaseAdmin
    .from('games')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published');
  return count ?? 0;
}

const CAT_COLORS = [
  { bg: 'bg-pink-400', shadow: 'shadow-[0_5px_0_0_#be185d]', text: 'text-pink-900' },
  { bg: 'bg-yellow-400', shadow: 'shadow-[0_5px_0_0_#b45309]', text: 'text-yellow-900' },
  { bg: 'bg-emerald-400', shadow: 'shadow-[0_5px_0_0_#047857]', text: 'text-emerald-900' },
  { bg: 'bg-purple-400', shadow: 'shadow-[0_5px_0_0_#6b21a8]', text: 'text-purple-900' },
  { bg: 'bg-orange-400', shadow: 'shadow-[0_5px_0_0_#c2410c]', text: 'text-orange-900' },
  { bg: 'bg-cyan-400', shadow: 'shadow-[0_5px_0_0_#0e7490]', text: 'text-cyan-900' },
];

export default async function HomePage() {
  const [featured, trending, newest, topRated, categories, totalGames] = await Promise.all([
    getFeatured(),
    getGames('popular', 10),
    getGames('newest', 10),
    getGames('rated', 10),
    getCategories(),
    getTotalGames(),
  ]);

  return (
    <div className="relative bg-gradient-to-b from-[#5B8DEF] via-[#5B8DEF] to-[#4A7BD9] min-h-screen overflow-hidden">
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0 opacity-50">
        <div className="absolute top-20 left-10 text-white text-3xl">☁️</div>
        <div className="absolute top-40 right-16 text-white text-4xl">⭐</div>
        <div className="absolute top-96 left-1/3 text-white text-2xl">✨</div>
        <div className="absolute top-[30rem] right-1/4 text-white text-3xl">☁️</div>
      </div>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-6">
        {/* TOP HUD */}
        <HomeHud totalGames={totalGames} />

        {/* HERO + side action stacks */}
        <div className="flex items-stretch gap-3">
          {/* Left side actions - column on desktop, hidden on mobile */}
          <div className="hidden lg:flex flex-col justify-center">
            <HomeSideActions side="left" />
          </div>

          {/* Center hero */}
          <div className="flex-1 min-w-0">
            <HomeHero games={featured.length > 0 ? featured : trending.slice(0, 3)} />
          </div>

          {/* Right side actions - column on desktop, hidden on mobile */}
          <div className="hidden lg:flex flex-col justify-center">
            <HomeSideActions side="right" />
          </div>
        </div>

        {/* Mobile-only side actions inline */}
        <div className="lg:hidden flex justify-center">
          <HomeSideActions />
        </div>

        {/* MODE DOCK - the 3 big chunky bottom buttons */}
        <HomeModeDock />

        {/* SECTION HEADERS + GAME ROWS */}
        <Section title="Trending Now" icon={<Flame size={22} className="text-orange-500" fill="currentColor" />} href="/games?sort=popular">
          <GameRow games={trending} />
        </Section>

        <Section title="Browse Categories" icon={<Gamepad2 size={22} className="text-blue-600" />} href="/categories">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3">
            {categories.slice(0, 12).map((cat, i) => {
              const c = CAT_COLORS[i % CAT_COLORS.length];
              return (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  className={`flex flex-col items-center justify-center gap-1 py-3 px-2 ${c.bg} ${c.shadow} ${c.text}
                              rounded-2xl border-[3px] border-white font-extrabold
                              hover:-translate-y-0.5 active:translate-y-1 active:shadow-none transition-all duration-150`}
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-[11px]">{cat.name}</span>
                </Link>
              );
            })}
          </div>
        </Section>

        <Section title="New Drops" icon={<Sparkles size={22} className="text-yellow-500" fill="currentColor" />} href="/games?sort=newest">
          <GameRow games={newest} />
        </Section>

        {topRated.length > 0 && (
          <Section title="Top Rated" icon={<Star size={22} className="text-yellow-500" fill="currentColor" />} href="/games?sort=rated">
            <GameRow games={topRated} />
          </Section>
        )}

        <section className="space-y-3">
          <SectionHeader title="All Games" icon={<Gamepad2 size={22} className="text-blue-600" />} />
          <HomeAllGamesSection />
        </section>
      </main>
    </div>
  );
}

function Section({ title, icon, href, children }: { title: string; icon: React.ReactNode; href?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <SectionHeader title={title} icon={icon} href={href} />
      {children}
    </section>
  );
}

function SectionHeader({ title, icon, href }: { title: string; icon: React.ReactNode; href?: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-2xl shadow-[0_4px_0_0_rgba(43,89,195,0.55)]">
        {icon}
        <h2 className="text-lg font-extrabold text-slate-800">{title}</h2>
      </div>
      {href && (
        <Link
          href={href}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-white text-blue-600 text-sm font-extrabold rounded-xl
                     shadow-[0_3px_0_0_rgba(43,89,195,0.55)]
                     hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all duration-150"
        >
          See all <ChevronRight size={16} />
        </Link>
      )}
    </div>
  );
}

function GameRow({ games }: { games: GameWithCategories[] }) {
  if (!games.length) {
    return (
      <div className="text-center py-12 bg-white/15 rounded-3xl text-white font-bold">
        No games yet
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
      {games.map((game) => (
        <HomeGameCard key={game.id} game={game} />
      ))}
    </div>
  );
}
