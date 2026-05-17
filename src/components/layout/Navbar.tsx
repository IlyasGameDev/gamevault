'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Menu, Search, X } from 'lucide-react';
import DeferredNavbarAuthMenu from '@/components/layout/DeferredNavbarAuthMenu';
import { Category } from '@/lib/types/database';

export default function Navbar({
  categories = [],
  sidebarExpanded = false,
  onToggleSidebar,
}: {
  categories?: Category[];
  sidebarExpanded?: boolean;
  onToggleSidebar?: () => void;
}) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const sidebarId = 'category-sidebar';

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/search?q=${encodeURIComponent(search.trim())}`);
      setMobileOpen(false);
    }
  }

  return (
    <nav className="sticky top-0 z-40 border-b border-[#252439] bg-[#171722]/95 backdrop-blur-md">
      <div className="mx-auto flex h-[60px] max-w-[1540px] items-center gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3 md:basis-0">
          <div className="relative hidden w-[46px] shrink-0 md:-ml-6 md:flex">
            <button
              type="button"
              onClick={onToggleSidebar}
              className={`flex h-[60px] w-[46px] items-center justify-center transition-colors hover:bg-white/10 ${
                sidebarExpanded ? 'bg-white/10 text-[#9B8CFF]' : 'text-white'
              }`}
              aria-label={sidebarExpanded ? 'Collapse categories' : 'Expand categories'}
              aria-controls={sidebarId}
              aria-expanded={sidebarExpanded}
            >
              <Menu size={24} strokeWidth={2.4} />
            </button>
          </div>

          <Link href="/" className="relative h-10 w-[135px] shrink-0 sm:w-[155px]" aria-label="YoPlayables home">
            <Image
              src="/yoplayables-logo.png"
              alt="YoPlayables"
              fill
              className="object-contain object-left"
              sizes="(max-width: 640px) 135px, 155px"
            />
          </Link>
        </div>

        <form onSubmit={handleSearch} className="hidden flex-[1.45] justify-center md:flex">
          <div className="relative w-full max-w-[630px]">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search games and categories"
              className="h-11 w-full rounded-full border border-transparent bg-[#3A3955] pl-6 pr-13 text-base font-semibold text-white outline-none transition-colors placeholder:text-[#B7B5C8] focus:border-[#6C5CFF] focus:bg-[#424061]"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[#C7C5D8] transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Search"
            >
              <Search size={22} strokeWidth={2.3} />
            </button>
          </div>
        </form>

        <div className="hidden flex-1 items-center justify-end gap-3 md:flex md:basis-0">
          <DeferredNavbarAuthMenu placement="desktop" />
        </div>

        <button
          className="ml-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[#25243A] text-[#D8D8E8] hover:text-white md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="space-y-4 border-t border-[#2A2A2A] bg-[#0F0F0F] px-4 py-4 md:hidden">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8A8A8]" size={16} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search games..."
                className="w-full rounded-full border border-[#2A2A2A] bg-[#1A1A1A] py-2 pl-9 pr-4 text-sm text-white outline-none placeholder:text-[#777] focus:border-[#6C5CFF]"
              />
            </div>
            <button type="submit" className="rounded-full bg-[#6C5CFF] px-4 py-2 text-sm font-bold text-white">Go</button>
          </form>
          <div className="grid grid-cols-2 gap-2">
            <Link href="/new-games" onClick={() => setMobileOpen(false)} className="rounded-xl bg-[#1A1A1A] px-3 py-2 text-sm text-[#D8D8D8]">New Games</Link>
            <Link href="/popular-games" onClick={() => setMobileOpen(false)} className="rounded-xl bg-[#1A1A1A] px-3 py-2 text-sm text-[#D8D8D8]">Popular</Link>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((cat) => (
              <Link key={cat.slug} href={`/categories/${cat.slug}`} onClick={() => setMobileOpen(false)}
                className="rounded-xl bg-[#1A1A1A] px-3 py-2 text-sm text-[#D8D8D8]">
                {cat.name}
              </Link>
            ))}
          </div>
          <DeferredNavbarAuthMenu placement="mobile" onNavigate={() => setMobileOpen(false)} />
        </div>
      )}
    </nav>
  );
}
