import Link from 'next/link';
import Image from 'next/image';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { GameWithCategories, Category } from '@/lib/types/database';
import {
  Zap, Trophy, Users, Compass, Gift, Package, Landmark, Crown,
  Store, HelpCircle, ChevronRight, Star, MessageSquare,
} from 'lucide-react';

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

const ACCENT_COLORS = ['#6BD4F0', '#FF5E9A', '#FCD635', '#5BCE5B', '#FF2EA1', '#2A3FAE'] as const;
const BADGE_LABELS = ['TURBO', 'NEW', 'HOT', '★', 'YUM', 'COZY', 'WOBBLE', 'ZEN'] as const;
const CAT_ICONS = ['◣◢', '◇', '◉◉', '◈', '✿', '◐', '◎', '♪', '◆', '★', '✦', '◬'] as const;
const CAT_ACCENT = ['#6BD4F0', '#FF5E9A', '#FCD635', '#5BCE5B', '#FF2EA1', '#2A3FAE'] as const;

const FALLBACK_CATS: Category[] = [
  { id: '1', slug: 'racing', name: 'Racing', icon: '◣◢', description: null, display_order: 1, created_at: '' },
  { id: '2', slug: 'puzzle', name: 'Puzzle', icon: '◇', description: null, display_order: 2, created_at: '' },
  { id: '3', slug: 'co-op', name: 'Co-op', icon: '◉◉', description: null, display_order: 3, created_at: '' },
  { id: '4', slug: 'roguelike', name: 'Roguelike', icon: '◈', description: null, display_order: 4, created_at: '' },
  { id: '5', slug: 'cozy', name: 'Cozy', icon: '✿', description: null, display_order: 5, created_at: '' },
  { id: '6', slug: 'horror', name: 'Horror', icon: '◐', description: null, display_order: 6, created_at: '' },
  { id: '7', slug: 'sports', name: 'Sports', icon: '◎', description: null, display_order: 7, created_at: '' },
  { id: '8', slug: 'rhythm', name: 'Rhythm', icon: '♪', description: null, display_order: 8, created_at: '' },
  { id: '9', slug: 'rpg', name: 'RPG', icon: '◆', description: null, display_order: 9, created_at: '' },
  { id: '10', slug: 'party', name: 'Party', icon: '★', description: null, display_order: 10, created_at: '' },
];

export default async function HomePage() {
  const [trending, newest, categories, totalGames] = await Promise.all([
    getGames('popular', 6),
    getGames('newest', 8),
    getCategories(),
    getTotalGames(),
  ]);

  const featured = trending[0];

  return (
    <div className="relative overflow-hidden">
      {/* ============ TOP NAV STRIP (action buttons) ============ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
          <NavPill icon={<Gift size={18} strokeWidth={2.5} />} label="REWARDS" color="#FF5E9A" notify />
          <NavPill icon={<Package size={18} strokeWidth={2.5} />} label="LOOT" color="#6BD4F0" notify />
          <NavPill icon={<Landmark size={18} strokeWidth={2.5} />} label="BANK" color="#2A3FAE" notify />
          <NavPill icon={<Crown size={18} strokeWidth={2.5} />} label="RANKS" color="#FCD635" dark />
          <div className="flex-1 hidden md:block" />
          <NavPill icon={<Users size={18} strokeWidth={2.5} />} label="FRIENDS" color="#5BCE5B" />
          <NavPill icon={<Store size={18} strokeWidth={2.5} />} label="STORE" color="#FF2EA1" notify />
          <NavPill icon={<HelpCircle size={18} strokeWidth={2.5} />} label="HELP" color="#FCD635" dark />
        </div>
      </div>

      {/* ============ HERO ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <div className="relative hub-diamond-bg border-[3px] border-[#0E1547] rounded-3xl shadow-chunk-lg overflow-hidden">
          {/* Floating badges */}
          <FloatingBadge top="14px" left="24px" color="#6BD4F0">
            tonight&apos;s drop just landed ↓
          </FloatingBadge>
          <FloatingBadge top="14px" right="24px" color="#FF5E9A">
            12,402 playing rn ✦
          </FloatingBadge>
          <FloatingBadge bottom="80px" left="24px" color="#FCD635">
            ◉ FREE FOREVER
          </FloatingBadge>

          <div className="relative grid lg:grid-cols-2 items-center gap-8 px-6 sm:px-10 py-16 sm:py-20">
            {/* Left: Giant GV mark */}
            <div className="relative flex justify-center">
              <div className="relative">
                <div className="absolute -inset-6 bg-[#FCD635] rounded-3xl rotate-3 border-[3px] border-[#0E1547]" />
                <div className="relative w-56 h-56 sm:w-64 sm:h-64 bg-[#0E1547] rounded-3xl border-[3px] border-[#0E1547] grid place-items-center shadow-chunk-lg">
                  <span className="text-[#FCD635] text-7xl sm:text-8xl font-extrabold tracking-tighter">GV</span>
                </div>
                {/* Rating badge */}
                <div className="absolute -bottom-4 -right-4 bg-[#FF5E9A] border-[3px] border-[#0E1547] rounded-2xl px-3 py-2 shadow-chunk-sm">
                  <div className="text-2xl font-extrabold text-white leading-none">9.3</div>
                  <div className="text-[10px] font-mono font-bold text-white">★★★★★</div>
                </div>
                <div className="absolute -top-4 -left-4 bg-[#6BD4F0] border-[3px] border-[#0E1547] rounded-xl px-3 py-1.5 shadow-chunk-sm font-mono text-xs font-extrabold text-[#0E1547]">
                  +47 NEW WEEKLY
                </div>
              </div>
            </div>

            {/* Right: copy + featured */}
            <div className="space-y-6">
              <div>
                <div className="font-mono text-xs font-bold text-[#0E1547]/70 mb-2">
                  ✦ HUB · {totalGames || '2,400'}+ GAMES LIVE
                </div>
                <h1 className="text-5xl sm:text-6xl font-extrabold leading-[0.95] tracking-tight text-[#0E1547]">
                  play in browser.
                  <br />
                  <span className="text-[#FF5E9A]">no downloads.</span>
                </h1>
                <p className="mt-4 text-base sm:text-lg font-medium text-[#0E1547]/80 max-w-md">
                  Tap and you&apos;re in. WebGL games for racing, puzzles, co-op,
                  cozy nights — whatever vibe you&apos;re on.
                </p>
              </div>

              {/* Featured card */}
              {featured && (
                <Link
                  href={`/games/${featured.slug}`}
                  className="group block bg-white border-[3px] border-[#0E1547] rounded-2xl p-3 shadow-chunk hover:-translate-y-1 active:translate-y-1 active:shadow-chunk-sm transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-20 h-20 shrink-0 rounded-xl border-[3px] border-[#0E1547] overflow-hidden bg-[#FCD635]">
                      {featured.thumbnail_url ? (
                        <Image src={featured.thumbnail_url} alt={featured.title} fill className="object-cover" />
                      ) : (
                        <div className="absolute inset-0 grid place-items-center text-2xl">🎮</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-[#FCD635] border-2 border-[#0E1547] text-[10px] font-extrabold text-[#0E1547] rounded-md font-mono">
                          FEATURED
                        </span>
                        <span className="font-mono text-[10px] font-bold text-[#0E1547]/70">
                          ◉ LIVE
                        </span>
                      </div>
                      <div className="font-extrabold text-lg text-[#0E1547] truncate">{featured.title}</div>
                      <div className="text-xs font-bold text-[#0E1547]/70 truncate">
                        {featured.categories[0]?.name ?? 'arcade'} · play now
                      </div>
                    </div>
                    <ChevronRight size={22} className="text-[#0E1547] shrink-0 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ============ MODE DOCK (Quick Match / Tournament / Friends / Discover) ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <ModeButton
            href="/games?sort=popular"
            color="#FF5E9A"
            icon={<Zap size={22} strokeWidth={2.5} className="text-white" />}
            title="QUICK MATCH"
            subtitle="play in 8 seconds"
          />
          <ModeButton
            href="/games?sort=rated"
            color="#2A3FAE"
            icon={<Trophy size={22} strokeWidth={2.5} className="text-white" />}
            title="TOURNAMENT"
            subtitle="prize: $4,200"
            badge="HOT"
          />
          <ModeButton
            href="/profile"
            color="#5BCE5B"
            icon={<Users size={22} strokeWidth={2.5} className="text-white" />}
            title="WITH FRIENDS"
            subtitle="3 online"
          />
          <ModeButton
            href="/games"
            color="#FCD635"
            icon={<Compass size={22} strokeWidth={2.5} className="text-[#0E1547]" />}
            title="DISCOVER"
            subtitle={`${totalGames || '2,400'} games`}
            dark
          />
        </div>
      </section>

      {/* ============ MARQUEE 1 ============ */}
      <Marquee
        color="#0E1547"
        text="◆ NOW TRENDING ◆ HOT THIS HOUR ◆ FRESH PICKS ◆ NEW SEASON ◆ JELLY KART ONLINE ◆"
        textColor="#FCD635"
      />

      {/* ============ NOW TRENDING ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-10">
        <SectionHeader
          title="now trending"
          tag="◉ updated 02:34 ago"
          href="/games?sort=popular"
        />
        <GameGrid games={trending} />
      </section>

      {/* ============ PICK A VIBE ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-12">
        <SectionHeader title="pick a vibe ✦" href="/categories" />
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {(categories.length > 0 ? categories : FALLBACK_CATS).slice(0, 12).map((cat, i) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group inline-flex items-center gap-2 px-4 py-2.5 bg-white border-[3px] border-[#0E1547] rounded-full shadow-chunk-sm hover:-translate-y-0.5 active:translate-y-1 active:shadow-none transition-all"
            >
              <span className="text-base" style={{ color: CAT_ACCENT[i % CAT_ACCENT.length] }}>
                {cat.icon || CAT_ICONS[i % CAT_ICONS.length]}
              </span>
              <span className="font-extrabold text-[#0E1547] text-sm">{cat.name}</span>
              <span className="font-mono text-[10px] font-bold text-[#0E1547]/60">
                {30 + (i * 17) % 100}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ============ MARQUEE 2 ============ */}
      <div className="mt-12">
        <Marquee
          color="#FF5E9A"
          text="◇ JUST DROPPED ◇ FRESH OUT THE OVEN ◇ DEVS YOU SHOULD KNOW ◇"
          textColor="#FFF8E6"
          reverse
        />
      </div>

      {/* ============ JUST DROPPED ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-10">
        <SectionHeader
          title="just dropped"
          tag="+47 THIS WEEK"
          href="/games?sort=newest"
        />
        <GameGrid games={newest} columns="lg:grid-cols-4" />
      </section>

      {/* ============ DEV CTA ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-16">
        <div className="bg-[#0E1547] border-[3px] border-[#0E1547] rounded-3xl shadow-chunk-lg overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-8 p-8 sm:p-12">
            {/* Left: pitch */}
            <div className="space-y-5">
              <div className="inline-block font-mono text-xs font-bold text-[#FCD635]">
                ◇ FOR DEVS
              </div>
              <h2 className="text-5xl sm:text-6xl font-extrabold leading-[0.95] tracking-tight text-[#FFF8E6]">
                make a game.
                <br />
                <span className="text-[#FCD635]">we&apos;ll host it.</span>
              </h2>
              <p className="text-base sm:text-lg font-medium text-[#FFF8E6]/80 max-w-md leading-relaxed">
                Push your WebGL build, get a public URL, and we handle leaderboards,
                multiplayer rooms, saves, and payouts. Free up to 10K monthly plays.
              </p>
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#FCD635] text-[#0E1547] border-[3px] border-[#FCD635] rounded-xl font-extrabold shadow-[0_6px_0_0_#6BD4F0] hover:-translate-y-1 active:translate-y-1 active:shadow-[0_2px_0_0_#6BD4F0] transition-all"
              >
                ► OPEN DEV CONSOLE
              </Link>
            </div>

            {/* Right: terminal mock */}
            <div className="bg-[#FFF8E6] rounded-2xl border-[3px] border-[#FFF8E6] p-4 sm:p-5 font-mono text-sm shadow-chunk">
              <div className="flex items-center gap-1.5 mb-4 pb-3 border-b-2 border-dashed border-[#0E1547]/20">
                <span className="w-3 h-3 rounded-full bg-[#FF3344] border-2 border-[#0E1547]" />
                <span className="w-3 h-3 rounded-full bg-[#FCD635] border-2 border-[#0E1547]" />
                <span className="w-3 h-3 rounded-full bg-[#5BCE5B] border-2 border-[#0E1547]" />
                <span className="ml-3 text-xs font-bold text-[#0E1547]/70">~/projects/my-game</span>
              </div>
              <div className="space-y-2 text-[#0E1547]">
                <div className="font-bold">
                  <span className="text-[#FF5E9A]">$</span> gv push ./build
                </div>
                <div className="text-[#0E1547]/70">↗ uploading 2.4MB...</div>
                <div className="text-[#5BCE5B] font-bold">
                  ✓ live at gamevault.gg/u/my-game
                </div>
                <div className="text-[#0E1547]/70">
                  →{' '}
                  <span className="bg-[#FCD635] px-1.5 py-0.5 rounded font-extrabold text-[#0E1547]">
                    342 plays
                  </span>{' '}
                  in first hour
                  <span className="ml-1 inline-block w-2 h-4 align-middle bg-[#0E1547]" style={{ animation: 'blink 1s steps(2) infinite' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* spacer */}
      <div className="h-16" />

      {/* Floating chat */}
      <button
        aria-label="Chat"
        className="fixed bottom-5 right-5 z-30 w-14 h-14 grid place-items-center bg-[#FCD635] border-[3px] border-[#0E1547] rounded-2xl shadow-chunk hover:-translate-y-1 active:translate-y-1 active:shadow-chunk-sm transition-all"
      >
        <MessageSquare size={22} strokeWidth={2.5} className="text-[#0E1547]" />
      </button>
    </div>
  );
}

/* ================= Sub-components ================= */

function NavPill({
  icon, label, color, notify, dark,
}: { icon: React.ReactNode; label: string; color: string; notify?: boolean; dark?: boolean }) {
  return (
    <button
      className="relative inline-flex items-center gap-2 pl-2 pr-3 sm:pr-4 py-2 border-[3px] border-[#0E1547] rounded-xl shadow-chunk-sm hover:-translate-y-0.5 active:translate-y-1 active:shadow-none transition-all"
      style={{ background: color }}
    >
      <span className={`w-7 h-7 grid place-items-center rounded-md ${dark ? 'text-[#0E1547]' : 'text-[#0E1547]'}`}>
        {icon}
      </span>
      <span className={`text-xs sm:text-sm font-extrabold ${dark ? 'text-[#0E1547]' : 'text-[#0E1547]'}`}>
        {label}
      </span>
      {notify && (
        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 grid place-items-center bg-[#FF3344] border-2 border-[#0E1547] rounded-full text-white text-[10px] font-extrabold">
          !
        </span>
      )}
    </button>
  );
}

function FloatingBadge({
  children, color, top, left, right, bottom,
}: {
  children: React.ReactNode;
  color: string;
  top?: string; left?: string; right?: string; bottom?: string;
}) {
  const anim = top ? 'wobble' : 'bob';
  return (
    <div
      className="absolute hidden sm:flex items-center gap-1 z-10"
      style={{ top, left, right, bottom, animation: `${anim} 3s ease-in-out infinite` }}
    >
      <div
        className="px-3 py-1.5 border-[3px] border-[#0E1547] rounded-xl shadow-chunk-sm font-mono text-xs font-extrabold text-[#0E1547]"
        style={{ background: color }}
      >
        {children}
      </div>
      <svg width="22" height="22" viewBox="0 0 22 22" style={{ marginLeft: '-2px' }}>
        <path d="M2 0 L20 0 L11 20 Z" fill={color} stroke="#0E1547" strokeWidth="3" />
      </svg>
    </div>
  );
}

function ModeButton({
  href, color, icon, title, subtitle, badge, dark,
}: {
  href: string; color: string; icon: React.ReactNode;
  title: string; subtitle: string; badge?: string; dark?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group relative flex items-center gap-3 px-4 py-4 border-[3px] border-[#0E1547] rounded-2xl shadow-chunk hover:-translate-y-1 active:translate-y-1 active:shadow-chunk-sm transition-all"
      style={{ background: color }}
    >
      <div className="w-12 h-12 grid place-items-center bg-[#0E1547] rounded-xl border-[3px] border-[#0E1547] shrink-0">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className={`font-extrabold text-sm leading-none mb-1 ${dark ? 'text-[#0E1547]' : 'text-white'}`}>
          {title}
        </div>
        <div className={`text-xs font-bold truncate ${dark ? 'text-[#0E1547]/80' : 'text-white/80'}`}>
          {subtitle}
        </div>
      </div>
      {badge && (
        <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-[#FF3344] text-white text-[10px] font-extrabold rounded-md border-2 border-[#0E1547] font-mono">
          {badge}
        </span>
      )}
    </Link>
  );
}

function Marquee({
  text, color, textColor, reverse,
}: { text: string; color: string; textColor: string; reverse?: boolean }) {
  // Duplicate copies so translate -50% creates a seamless loop
  const copies = Array.from({ length: 8 });
  return (
    <div
      className="mt-10 border-y-[3px] border-[#0E1547] overflow-hidden"
      style={{ background: color }}
    >
      <div
        className="flex whitespace-nowrap py-3 w-max marquee-mask"
        style={{ animation: `${reverse ? 'marquee-rev' : 'marquee'} 30s linear infinite` }}
      >
        {copies.map((_, i) => (
          <span
            key={i}
            className="font-mono text-sm font-extrabold mx-4 tracking-wider"
            style={{ color: textColor }}
          >
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}

function SectionHeader({ title, tag, href }: { title: string; tag?: string; href?: string }) {
  return (
    <div className="flex items-end justify-between mb-5 gap-3 flex-wrap">
      <div className="flex items-baseline gap-3">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0E1547] lowercase">
          {title}
        </h2>
        {tag && (
          <div className="font-mono text-xs font-bold text-[#0E1547]/70 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#5BCE5B] inline-block" />
            {tag}
          </div>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border-[3px] border-[#0E1547] text-[#0E1547] text-sm font-extrabold rounded-xl shadow-chunk-sm hover:-translate-y-0.5 active:translate-y-1 active:shadow-none transition-all"
        >
          see all <ChevronRight size={16} strokeWidth={2.5} />
        </Link>
      )}
    </div>
  );
}

function GameGrid({ games, columns }: { games: GameWithCategories[]; columns?: string }) {
  if (!games.length) {
    return (
      <div className="text-center py-12 bg-white border-[3px] border-[#0E1547] rounded-2xl font-extrabold text-[#0E1547]">
        no games yet · check back soon ✦
      </div>
    );
  }
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 ${columns ?? 'lg:grid-cols-3'} gap-3 sm:gap-4`}>
      {games.map((g, i) => (
        <HubGameCard key={g.id} game={g} index={i} />
      ))}
    </div>
  );
}

function HubGameCard({ game, index }: { game: GameWithCategories; index: number }) {
  const accent = ACCENT_COLORS[index % ACCENT_COLORS.length];
  const badge = BADGE_LABELS[index % BADGE_LABELS.length];
  const cat = game.categories[0]?.name?.toLowerCase() ?? 'arcade';
  const rating = game.rating_avg ? Number(game.rating_avg).toFixed(1) : '8.7';

  return (
    <Link
      href={`/games/${game.slug}`}
      className="group block bg-white border-[3px] border-[#0E1547] rounded-2xl overflow-hidden shadow-chunk hover:-translate-y-1 active:translate-y-1 active:shadow-chunk-sm transition-all"
    >
      <div className="relative aspect-[4/3] border-b-[3px] border-[#0E1547] overflow-hidden">
        {/* Badge */}
        <div
          className="absolute top-2 left-2 z-10 px-2 py-0.5 border-2 border-[#0E1547] text-[10px] font-extrabold text-[#0E1547] rounded-md font-mono shadow-chunk-sm"
          style={{ background: accent }}
        >
          {badge}
        </div>

        {game.thumbnail_url ? (
          <Image
            src={game.thumbnail_url}
            alt={game.title}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div
            className="absolute inset-0 grid place-items-center"
            style={{ background: accent }}
          >
            <span className="text-3xl font-extrabold text-[#0E1547] tracking-tighter">
              {game.title.slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      <div className="p-3 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="font-extrabold text-sm text-[#0E1547] uppercase truncate">
            {game.title}
          </div>
          <div className="font-mono text-[10px] font-bold text-[#0E1547]/70 truncate">
            {cat} · {game.play_count > 100 ? `${game.play_count} plays` : 'fresh'}
          </div>
        </div>
        <div className="flex items-center gap-0.5 text-[#0E1547] shrink-0">
          <Star size={12} fill="#FCD635" stroke="#0E1547" strokeWidth={2} />
          <span className="text-xs font-extrabold">{rating}</span>
        </div>
      </div>
    </Link>
  );
}
