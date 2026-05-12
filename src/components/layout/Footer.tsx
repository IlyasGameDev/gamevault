import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="relative mt-16 border-t-[3px] border-[#0E1547] bg-[#FFF8E6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand column */}
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-[#6BD4F0] border-[3px] border-[#0E1547] grid place-items-center shadow-chunk-sm">
                <span className="font-extrabold text-[#0E1547] text-sm tracking-tighter">GV</span>
              </div>
              <div className="flex items-baseline font-extrabold text-xl text-[#0E1547] leading-none">
                <span>gamevault</span>
                <span className="text-[#FF5E9A]">.gg</span>
              </div>
            </Link>
            <p className="text-sm font-medium text-[#0E1547]/80 leading-relaxed">
              A WebGL game platform built for people who want to play, not download. 2,400 games and counting.
            </p>
          </div>

          <FooterColumn
            title="PLAY"
            links={[
              { label: 'Browse all', href: '/games' },
              { label: 'Trending', href: '/games?sort=popular' },
              { label: 'New releases', href: '/games?sort=newest' },
              { label: 'Top rated', href: '/games?sort=rated' },
              { label: 'My library', href: '/profile' },
            ]}
          />
          <FooterColumn
            title="BUILD"
            links={[
              { label: 'Dev console', href: '#' },
              { label: 'Docs', href: '#' },
              { label: 'Engine SDK', href: '#' },
              { label: 'Multiplayer API', href: '#' },
              { label: 'Revenue', href: '#' },
            ]}
          />
          <FooterColumn
            title="MORE"
            links={[
              { label: 'Discord', href: '#' },
              { label: 'Blog', href: '#' },
              { label: 'Jobs', href: '#' },
              { label: 'Press kit', href: '#' },
              { label: 'Terms', href: '#' },
            ]}
          />
        </div>

        <div className="mt-12 pt-6 border-t-2 border-dashed border-[#0E1547]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="font-mono text-xs font-bold text-[#0E1547]">
            © 2026 GAMEVAULT.GG — vibes only
          </div>
          <div className="font-mono text-xs font-bold text-[#0E1547]/70">
            made on the internet ✦ 2,491 servers worldwide
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <div className="inline-block px-3 py-1 bg-[#0E1547] text-[#FCD635] text-xs font-extrabold rounded-md mb-4">
        {title}
      </div>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              className="text-sm font-bold text-[#0E1547] hover:text-[#FF5E9A] transition-colors"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
