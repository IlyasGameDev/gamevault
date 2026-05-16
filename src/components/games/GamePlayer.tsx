'use client';
import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Gamepad2, Maximize2, Minimize2 } from 'lucide-react';
import { Game } from '@/lib/types/database';
import Image from 'next/image';
import Link from 'next/link';
import GameActions from '@/components/games/GameActions';

interface GamePlayerProps {
  game: Game;
}

type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitFullscreenEnabled?: boolean;
  webkitExitFullscreen?: () => Promise<void> | void;
};

type FullscreenElement = HTMLDivElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};

function getActiveFullscreenElement() {
  const fullscreenDocument = document as FullscreenDocument;
  return document.fullscreenElement ?? fullscreenDocument.webkitFullscreenElement ?? null;
}

function getGameSrc(game: Game): string {
  if (game.game_type === 'iframe' && game.iframe_url) return game.iframe_url;
  if (game.game_type === 'hosted' && game.game_file_path) {
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/games/${game.game_file_path}/${game.game_entry_file}`;
  }
  return '';
}

export default function GamePlayer({ game }: GamePlayerProps) {
  const [nativeFullscreen, setNativeFullscreen] = useState(false);
  const [pseudoFullscreen, setPseudoFullscreen] = useState(false);
  const [frameSize, setFrameSize] = useState<{ width: number; height: number } | null>(null);
  const sizerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const playTrackedRef = useRef(false);
  const src = getGameSrc(game);
  const fullscreen = nativeFullscreen || pseudoFullscreen;
  const gameWidth = game.width > 0 ? game.width : 16;
  const gameHeight = game.height > 0 ? game.height : 9;
  const aspectRatio = `${gameWidth}/${gameHeight}`;

  useEffect(() => {
    function onFsChange() {
      setNativeFullscreen(getActiveFullscreenElement() === containerRef.current);
    }

    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);

    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange);
    };
  }, []);

  useEffect(() => {
    if (!pseudoFullscreen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setPseudoFullscreen(false);
    }

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [pseudoFullscreen]);

  useLayoutEffect(() => {
    if (fullscreen) return;

    const sizer = sizerRef.current;
    if (!sizer) return;

    function updateFrameSize() {
      if (!sizer) return;

      const bounds = sizer.getBoundingClientRect();
      if (bounds.width <= 0) return;

      const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
      const availableHeight = Math.max(220, viewportHeight - bounds.top - 12);
      const scale = Math.min(bounds.width / gameWidth, availableHeight / gameHeight);

      setFrameSize({
        width: Math.floor(gameWidth * scale),
        height: Math.floor(gameHeight * scale),
      });
    }

    updateFrameSize();

    const resizeObserver = new ResizeObserver(updateFrameSize);
    resizeObserver.observe(sizer);
    window.addEventListener('resize', updateFrameSize);
    window.visualViewport?.addEventListener('resize', updateFrameSize);
    window.visualViewport?.addEventListener('scroll', updateFrameSize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateFrameSize);
      window.visualViewport?.removeEventListener('resize', updateFrameSize);
      window.visualViewport?.removeEventListener('scroll', updateFrameSize);
    };
  }, [fullscreen, gameHeight, gameWidth]);

  async function toggleFullscreen() {
    const fullscreenDocument = document as FullscreenDocument;
    const fullscreenElement = getActiveFullscreenElement();

    if (fullscreenElement) {
      setPseudoFullscreen(false);
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else {
        await fullscreenDocument.webkitExitFullscreen?.();
      }
      return;
    }

    if (pseudoFullscreen) {
      setPseudoFullscreen(false);
      return;
    }

    try {
      const fullscreenContainer = containerRef.current as FullscreenElement | null;

      if (document.fullscreenEnabled && fullscreenContainer?.requestFullscreen) {
        await fullscreenContainer.requestFullscreen({ navigationUI: 'hide' });
        if (getActiveFullscreenElement() !== fullscreenContainer) {
          setPseudoFullscreen(true);
        }
      } else if (fullscreenDocument.webkitFullscreenEnabled && fullscreenContainer?.webkitRequestFullscreen) {
        await fullscreenContainer.webkitRequestFullscreen();
        if (getActiveFullscreenElement() !== fullscreenContainer) {
          setPseudoFullscreen(true);
        }
      } else {
        setPseudoFullscreen(true);
      }
    } catch {
      setPseudoFullscreen(true);
    }
  }

  async function trackPlay() {
    if (playTrackedRef.current) return;
    playTrackedRef.current = true;

    try {
      await fetch('/api/games/play', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game_id: game.id }),
      });
    } catch {}
  }

  return (
    <>
      <div ref={sizerRef} className="w-full">
        <div
          ref={containerRef}
          className={`overflow-hidden rounded-lg bg-black shadow-2xl shadow-black/45 ${
            fullscreen ? 'w-screen rounded-none' : 'mx-auto w-full'
          } ${
            pseudoFullscreen ? 'fixed inset-0 z-[80]' : 'relative'
          }`}
          style={
            fullscreen
              ? { height: '100dvh' }
              : {
                  aspectRatio,
                  height: frameSize ? `${frameSize.height}px` : undefined,
                  width: frameSize ? `${frameSize.width}px` : undefined,
                  maxWidth: '100%',
                }
          }
        >
          <iframe
            src={src}
            className="w-full h-full border-0"
            allow="fullscreen; autoplay; gamepad; microphone"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            title={game.title}
            onLoad={trackPlay}
          />
          <button
            onClick={toggleFullscreen}
            className="absolute right-3 top-3 z-10 rounded-full bg-black/70 p-2 text-white transition-colors hover:bg-black"
            title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      <div className="mt-2 flex min-h-14 flex-col gap-2 rounded-lg bg-[#202035] px-3 py-2 shadow-lg shadow-black/20 sm:flex-row sm:items-center sm:justify-between">
        <Link href={`/games/${game.slug}`} className="flex min-w-0 items-center gap-2.5" aria-label={game.title}>
          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-[#2B2A43]">
            {game.thumbnail_url ? (
              <Image src={game.thumbnail_url} alt="" fill className="object-cover" sizes="36px" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Gamepad2 size={18} className="text-[#9B8CFF]" />
              </div>
            )}
          </div>
          <h1 className="truncate text-base font-black text-white sm:text-lg">{game.title}</h1>
        </Link>
        <div className="min-w-0 overflow-x-auto">
          <GameActions
            game={game}
            variant="toolbar"
            fullscreen={fullscreen}
            onFullscreenToggle={toggleFullscreen}
          />
        </div>
      </div>
    </>
  );
}
