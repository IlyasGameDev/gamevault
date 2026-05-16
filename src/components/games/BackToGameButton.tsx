'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export default function BackToGameButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const player = document.getElementById('game-player');
    if (!player) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { rootMargin: '-20% 0px -35% 0px', threshold: 0.01 }
    );

    observer.observe(player);
    return () => observer.disconnect();
  }, []);

  return (
    <a
      href="#game-player"
      aria-label="Back to game"
      className={[
        'fixed bottom-4 left-1/2 z-50 inline-flex h-12 max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-1.5 rounded-full border border-white/15',
        'whitespace-nowrap bg-[#6C45FF] px-4 text-sm font-black text-white shadow-2xl shadow-[#6C45FF]/35 backdrop-blur',
        'transition-[opacity,transform,background-color,box-shadow] duration-300 hover:-translate-y-1 hover:bg-[#7D5CFF] hover:shadow-[#7D5CFF]/45',
        'focus:outline-none focus:ring-4 focus:ring-[#9B8CFF]/40 sm:bottom-7 sm:h-[60px] sm:gap-2 sm:px-6 sm:text-base',
        'motion-safe:animate-[back-to-game-glow_3.2s_ease-in-out_infinite] motion-reduce:animate-none',
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0',
      ].join(' ')}
    >
      <span className="inline-flex items-center gap-2 motion-safe:animate-[back-to-game-bob_3.2s_ease-in-out_infinite] motion-reduce:animate-none">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/15 sm:h-8 sm:w-8">
          <ArrowUp className="h-[18px] w-[18px] sm:h-[19px] sm:w-[19px]" strokeWidth={2.7} />
        </span>
        <span className="min-[360px]:hidden">Back</span>
        <span className="hidden min-[360px]:inline">Back to game</span>
      </span>
    </a>
  );
}
