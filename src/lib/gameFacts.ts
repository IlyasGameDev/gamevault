import type { Game } from '@/lib/types/database';

type SupplierRecord = {
  slug: string;
  embedId: string;
  developer: string;
  mobile: boolean;
  localControls?: string;
  controls?: string;
  tip?: string;
};

// The source link for each record is exposed on its game page. Match the embed as well
// as the title so similarly named games cannot inherit another studio's credits.
export const supplierRecords: SupplierRecord[] = [
  {
    slug: 'arrow-count-master', embedId: '6dtv4ssq6cyfi00abbsebalcpdekubr8',
    developer: 'Raccoon', mobile: true,
    tip: 'Swipe sideways to line up with a gate. Compare the effect on your current arrow count before you cross.',
  },
  {
    slug: 'long-neck', embedId: 'l1yxw9b1cyuacnv8nrt83w97vt20xymj',
    developer: 'mir-games.net', mobile: true,
    tip: 'Follow rings that match your character’s color to build neck height.',
  },
  {
    slug: 'labbuster', embedId: '4bi896jnadqe2ti5xjrozs6po0ic4dhf',
    developer: 'bestgames.com', mobile: false,
  },
  {
    slug: 'contra-jungle-breach', embedId: 'gadcmw15on754dsa2y9vyzms8uxs36ss',
    developer: 'BestCrazyGames', mobile: true,
    controls: 'Move and aim with WASD or the arrow keys. Jump with Space or K, shoot with J or X, and reload with F. Shift or L dashes. The mouse also aims and fires. Pause with P or Escape, retry with R, and mute with M. On touchscreens, use the on-screen buttons.',
  },
  {
    slug: 'stairs-races-for-2-players', embedId: 'rtg6s3o9k88zgs5kdnaqwtso1ls1t5t4',
    developer: 'stelennnn', mobile: true,
    localControls: 'Blue uses WASD or the left touch joystick. Red uses the arrow keys or the right touch joystick.',
  },
  {
    slug: 'escape-school-duel', embedId: 'c8knm7hay0hh38clhrvnxh82u7ocy8mo',
    developer: 'gameVgames', mobile: false,
    localControls: 'Player one moves with WASD, jumps with Space and runs with left Shift. Player two uses the arrows, L to jump and K to run.',
  },
];

export function gameFacts(game: Pick<Game, 'iframe_url' | 'developer' | 'developer_url'>) {
  const url = game.iframe_url && URL.canParse(game.iframe_url) ? new URL(game.iframe_url) : null;
  const distributed = !!url && /^html5\.gamemonetize\.(co|com|games)$/.test(url.hostname);
  const record = distributed ? supplierRecords.find((entry) => entry.embedId === url.pathname.split('/')[1]) : undefined;
  const knownDeveloper = game.developer && !(distributed && game.developer.trim().toLowerCase() === 'gamemonetize');

  return {
    record,
    developer: knownDeveloper ? game.developer : record?.developer,
    developerUrl: knownDeveloper ? game.developer_url : null,
    distributor: distributed ? 'GameMonetize' : null,
    source: record ? `https://gamemonetize.com/${record.slug}-game` : null,
  };
}
