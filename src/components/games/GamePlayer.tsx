'use client';
import { useState, useRef, useEffect } from 'react';
import { Play, Maximize2, Minimize2 } from 'lucide-react';
import { Game } from '@/lib/types/database';
import Image from 'next/image';
import Button from '@/components/ui/Button';

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
      className="relative w-full bg-black rounded-xl overflow-hidden"
      style={{ aspectRatio: `${game.width}/${game.height}` }}
    >
      {!started ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          {game.thumbnail_url && (
            <Image src={game.thumbnail_url} alt={game.title} fill className="object-cover opacity-30" />
          )}
          <div className="relative z-10 flex flex-col items-center gap-4">
            <button
              onClick={handlePlay}
              className="w-20 h-20 rounded-full bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center shadow-2xl shadow-indigo-500/50 transition-transform hover:scale-110"
            >
              <Play size={36} fill="white" className="text-white ml-1" />
            </button>
            <p className="text-white font-semibold text-lg">{game.title}</p>
            <p className="text-gray-400 text-sm">Click to play</p>
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
            className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black/80 rounded-lg text-white transition-colors z-10"
            title="Toggle fullscreen"
          >
            {fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </>
      )}
    </div>
  );
}
