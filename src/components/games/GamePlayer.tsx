'use client';
import { useState, useRef, useEffect } from 'react';
import { Gamepad2, Play, Maximize2, Minimize2 } from 'lucide-react';
import { Game } from '@/lib/types/database';
import Image from 'next/image';

interface GamePlayerProps {
  game: Game;
}

function getGameSrc(game: Game): string {
  if (game.game_type === 'iframe' && game.iframe_url) return game.iframe_url;
  if (game.game_type === 'hosted' && game.game_file_path) {
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/games/${game.game_file_path}/${game.game_entry_file}`;
  }
  return '';
}

export default function GamePlayer({ game }: GamePlayerProps) {
  const [started, setStarted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const src = getGameSrc(game);

  useEffect(() => {
    function onFsChange() {
      setFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  async function toggleFullscreen() {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  }

  async function handlePlay() {
    setStarted(true);
    // Track play count
    try {
      await fetch('/api/games/play', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game_id: game.id }),
      });
    } catch {}
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-2xl border border-[#2A2A2A] bg-black shadow-2xl shadow-black/40"
      style={{ aspectRatio: `${game.width}/${game.height}` }}
    >
      {!started ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          {game.thumbnail_url ? (
            <Image src={game.thumbnail_url} alt={game.title} fill className="object-cover opacity-35" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[#181818]">
              <Gamepad2 size={56} className="text-[#555]" />
            </div>
          )}
          <div className="relative z-10 flex flex-col items-center gap-4">
            <button
              onClick={handlePlay}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-[#6C5CFF] shadow-2xl shadow-black/50 transition-transform hover:scale-105 hover:bg-[#5A49F5]"
              aria-label={`Play ${game.title}`}
            >
              <Play size={36} fill="white" className="text-white ml-1" />
            </button>
            <p className="text-lg font-bold text-white">{game.title}</p>
            <p className="text-sm text-[#A8A8A8]">Click to play instantly</p>
          </div>
        </div>
      ) : (
        <>
          <iframe
            src={src}
            className="w-full h-full border-0"
            allow="fullscreen; autoplay; gamepad; microphone"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            title={game.title}
          />
          <button
            onClick={toggleFullscreen}
            className="absolute right-3 top-3 z-10 rounded-full bg-black/70 p-2 text-white transition-colors hover:bg-black"
            title="Toggle fullscreen"
          >
            {fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </>
      )}
    </div>
  );
}
