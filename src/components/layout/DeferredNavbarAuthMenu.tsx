'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const NavbarAuthMenu = dynamic(() => import('@/components/layout/NavbarAuthMenu'), {
  ssr: false,
});

export default function DeferredNavbarAuthMenu({
  placement,
  onNavigate,
}: {
  placement: 'desktop' | 'mobile';
  onNavigate?: () => void;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 768px)');
    const load = () => {
      if (placement === 'mobile' || desktop.matches) setReady(true);
    };
    desktop.addEventListener('change', load);
    if (document.readyState === 'complete') {
      load();
    } else {
      window.addEventListener('load', load, { once: true });
    }
    return () => {
      desktop.removeEventListener('change', load);
      window.removeEventListener('load', load);
    };
  }, [placement]);

  if (!ready) {
    return placement === 'desktop' ? <DesktopFallback /> : <MobileFallback onNavigate={onNavigate} />;
  }

  return <NavbarAuthMenu placement={placement} onNavigate={onNavigate} />;
}

function DesktopFallback() {
  return (
    <Link
      href="/login"
      className="relative h-11 w-11 overflow-hidden rounded-full border-2 border-[#6C5CFF]/40 bg-[#25243A] transition-colors hover:border-[#9B8CFF]"
      aria-label="Sign in"
    >
      <Image
        src="/maskot.png"
        alt="YoPlayables mascot"
        fill
        className="object-cover"
        sizes="44px"
      />
    </Link>
  );
}

function MobileFallback({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex gap-2">
      <Link href="/login" onClick={onNavigate} className="flex-1 rounded-full bg-[#1A1A1A] py-2 text-center text-sm text-[#D8D8D8]">Sign in</Link>
      <Link href="/register" onClick={onNavigate} className="flex-1 rounded-full bg-[#6C5CFF] py-2 text-center text-sm font-bold text-white">Sign up</Link>
    </div>
  );
}
