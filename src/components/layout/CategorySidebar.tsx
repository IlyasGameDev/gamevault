'use client';
import { useState } from 'react';
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

export default function CategorySidebar({
  categories = [],
  expanded = false,
}: {
  categories?: Category[];
  expanded?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const pathname = usePathname();
  const categorySlugs = new Set(categories.map((category) => category.slug));
  const primaryItems = PRIMARY_ITEMS.filter((item) => !item.categorySlug || categorySlugs.has(item.categorySlug));
  const primaryCategorySlugs = new Set(primaryItems.map((item) => item.categorySlug).filter(Boolean));
  const categoryItems = categories.filter((category) => !primaryCategorySlugs.has(category.slug));
  const visibleExpanded = expanded || hovered;

  return (
    <aside
      id="category-sidebar"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        'fixed bottom-0 left-0 top-[60px] z-30 hidden overflow-hidden border-r border-[#252439] bg-[#0D0D17] transition-[width] duration-200 ease-out md:block',
        visibleExpanded ? 'w-[206px]' : 'w-[46px]'
      )}
    >
      <nav
        className={cn(
          'h-full overflow-x-hidden py-2',
          visibleExpanded
            ? 'overflow-y-auto [scrollbar-color:#8A84A8_transparent] [scrollbar-width:thin]'
            : 'overflow-y-hidden'
        )}
      >
        <div className="space-y-0.5">
          {primaryItems.map((item) => (
            <SidebarItem key={item.label} item={item} active={isActive(pathname, item.href)} expanded={visibleExpanded} />
          ))}
        </div>

        {categoryItems.length > 0 && <div className={cn('my-2.5 h-px bg-[#2C2B42]', visibleExpanded ? 'mx-4' : 'mx-3')} />}

        <div className="space-y-0.5 pb-3">
          {categoryItems.map((category) => (
            <SidebarCategoryItem key={category.id} category={category} active={isActive(pathname, `/categories/${category.slug}`)} expanded={visibleExpanded} />
          ))}
        </div>
      </nav>
    </aside>
  );
}

function SidebarItem({
  item,
  active,
  expanded,
}: {
  item: { label: string; href: string; icon: typeof Home; categorySlug?: string };
  active: boolean;
  expanded: boolean;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        'relative mx-1 flex h-8 items-center gap-2.5 rounded-lg px-[9px] text-[#F4F3FF] transition-colors hover:bg-[#232236]',
        active && 'text-[#9B8CFF]'
      )}
      title={item.label}
    >
      {active && <span className="absolute -left-1 h-6 w-0.5 rounded-r-full bg-[#9B8CFF]" />}
      <Icon size={18} strokeWidth={2.35} className="h-5 w-5 shrink-0 text-[#9B8CFF]" />
      <span className={cn('whitespace-nowrap text-[14px] font-semibold transition-opacity duration-150', expanded ? 'opacity-100' : 'opacity-0')}>
        {item.label}
      </span>
    </Link>
  );
}

function SidebarCategoryItem({ category, active, expanded }: { category: Category; active: boolean; expanded: boolean }) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className={cn(
        'relative mx-1 flex h-8 items-center gap-2.5 rounded-lg px-[9px] text-[#F4F3FF] transition-colors hover:bg-[#232236]',
        active && 'text-[#9B8CFF]'
      )}
      title={category.name}
    >
      {active && <span className="absolute -left-1 h-6 w-0.5 rounded-r-full bg-[#9B8CFF]" />}
      <GameIcon type={category.slug} size={18} className="h-5 w-5 text-[#9B8CFF]" />
      <span className={cn('whitespace-nowrap text-[14px] font-semibold transition-opacity duration-150', expanded ? 'opacity-100' : 'opacity-0')}>
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
