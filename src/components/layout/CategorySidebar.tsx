'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Clock3,
  Flame,
  Gamepad2,
  Home,
  Medal,
  Sparkles,
  UsersRound,
  Repeat2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Category } from '@/lib/types/database';
import GameIcon from '@/components/ui/GameIcon';

const PRIMARY_ITEMS = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Recently played', href: '/profile', icon: Clock3 },
  { label: 'New', href: '/games?sort=newest', icon: Sparkles },
  { label: 'Popular Games', href: '/games?sort=popular', icon: Flame },
  { label: 'Updated', href: '/games?sort=newest', icon: Repeat2 },
  { label: 'Originals', href: '/games?sort=rated', icon: Gamepad2 },
  { label: 'Multiplayer', href: '/categories/multiplayer', icon: UsersRound, categorySlug: 'multiplayer' },
  { label: 'Leaderboards', href: '/games?sort=rated', icon: Medal },
];

export default function CategorySidebar({ categories = [] }: { categories?: Category[] }) {
  const pathname = usePathname();
  const categorySlugs = new Set(categories.map((category) => category.slug));
  const primaryItems = PRIMARY_ITEMS.filter((item) => !item.categorySlug || categorySlugs.has(item.categorySlug));
  const primaryCategorySlugs = new Set(primaryItems.map((item) => item.categorySlug).filter(Boolean));
  const categoryItems = categories.filter((category) => !primaryCategorySlugs.has(category.slug));

  return (
    <aside className="group/sidebar fixed bottom-0 left-0 top-[60px] z-30 hidden w-[46px] overflow-hidden border-r border-[#252439] bg-[#0D0D17] transition-[width] duration-200 ease-out hover:w-[206px] md:block">
      <nav className="h-full overflow-y-hidden overflow-x-hidden py-2 group-hover/sidebar:overflow-y-auto group-hover/sidebar:[scrollbar-width:thin] group-hover/sidebar:[scrollbar-color:#8A84A8_transparent]">
        <div className="space-y-0.5">
          {primaryItems.map((item) => (
            <SidebarItem key={item.label} item={item} active={isActive(pathname, item.href)} />
          ))}
        </div>

        {categoryItems.length > 0 && <div className="mx-3 my-2.5 h-px bg-[#2C2B42] group-hover/sidebar:mx-4" />}

        <div className="space-y-0.5 pb-3">
          {categoryItems.map((category) => (
            <SidebarCategoryItem key={category.id} category={category} active={isActive(pathname, `/categories/${category.slug}`)} />
          ))}
        </div>
      </nav>
    </aside>
  );
}

function SidebarItem({
  item,
  active,
}: {
  item: { label: string; href: string; icon: typeof Home; categorySlug?: string };
  active: boolean;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        'relative mx-1 flex h-8 items-center gap-2.5 rounded-lg px-2.5 text-[#F4F3FF] transition-colors hover:bg-[#232236]',
        active && 'text-[#9B8CFF]'
      )}
      title={item.label}
    >
      {active && <span className="absolute -left-1 h-6 w-0.5 rounded-r-full bg-[#9B8CFF]" />}
      <Icon size={18} strokeWidth={2.35} className="h-5 w-5 shrink-0 text-[#9B8CFF]" />
      <span className="whitespace-nowrap text-[14px] font-semibold opacity-0 transition-opacity duration-150 group-hover/sidebar:opacity-100">
        {item.label}
      </span>
    </Link>
  );
}

function SidebarCategoryItem({ category, active }: { category: Category; active: boolean }) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className={cn(
        'relative mx-1 flex h-8 items-center gap-2.5 rounded-lg px-2.5 text-[#F4F3FF] transition-colors hover:bg-[#232236]',
        active && 'text-[#9B8CFF]'
      )}
      title={category.name}
    >
      {active && <span className="absolute -left-1 h-6 w-0.5 rounded-r-full bg-[#9B8CFF]" />}
      <GameIcon type={category.slug} size={18} className="h-5 w-5 text-[#9B8CFF]" />
      <span className="whitespace-nowrap text-[14px] font-semibold opacity-0 transition-opacity duration-150 group-hover/sidebar:opacity-100">
        {category.name}
      </span>
    </Link>
  );
}

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  const cleanHref = href.split('?')[0];
  return pathname === cleanHref;
}
