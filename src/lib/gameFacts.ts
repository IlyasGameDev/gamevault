import type { Game } from '@/lib/types/database';

type SupplierRecord = {
  slug: string;
  sourceSlug?: string;
  embedId: string;
  developer: string;
  mobile: boolean;
  summary: string;
  localControls?: string;
  controls?: string;
  tip?: string;
};

// Match the distributor's embed ID so similarly named games cannot inherit another studio's credits.
export const supplierRecords: SupplierRecord[] = [
  {
    slug: 'arrow-count-master', embedId: '6dtv4ssq6cyfi00abbsebalcpdekubr8',
    developer: 'Raccoon', mobile: true,
    summary: 'Guide a cluster of arrows through numbered gates. Adding or multiplying at the right moment helps you reach the end with a larger count.',
    tip: 'In our 390 × 844 Chromium touch test, the opening gates offered +5 on the left and +15 on the right. Swipe right before reaching the gate to collect ten extra arrows.',
  },
  {
    slug: 'long-neck', embedId: 'l1yxw9b1cyuacnv8nrt83w97vt20xymj',
    developer: 'mir-games.net', mobile: true,
    summary: 'Steer toward rings that match your runner. Each one adds height to the stack around your neck.',
    tip: 'Follow rings that match your character’s color to build neck height.',
  },
  {
    slug: 'labbuster', embedId: '4bi896jnadqe2ti5xjrozs6po0ic4dhf',
    developer: 'bestgames.com', mobile: false,
    summary: 'Creatures have escaped their lab enclosures. Survive successive waves as they fill the laboratory.',
  },
  {
    slug: 'contra-jungle-breach', embedId: 'gadcmw15on754dsa2y9vyzms8uxs36ss',
    developer: 'BestCrazyGames', mobile: true,
    summary: 'Guide Mara through ten rescue-mission stages. Activate relays, find upgrades and use checkpoints on the way from the jungle to the alien lair.',
    controls: 'Move and aim with WASD or the arrow keys. Jump with Space or K, shoot with J or X, and reload with F. Shift or L dashes. The mouse also aims and fires. Pause with P or Escape, retry with R, and mute with M. On touchscreens, use the on-screen buttons.',
  },
  {
    slug: 'stairs-races-for-2-players', embedId: 'rtg6s3o9k88zgs5kdnaqwtso1ls1t5t4',
    developer: 'stelennnn', mobile: true,
    summary: 'Race another player to the top of a staircase. Collect blocks in your own color and carry them back to build the next steps.',
    localControls: 'Blue uses WASD or the left touch joystick. Red uses the arrow keys or the right touch joystick.',
  },
  {
    slug: 'escape-school-duel', embedId: 'c8knm7hay0hh38clhrvnxh82u7ocy8mo',
    developer: 'gameVgames', mobile: false,
    summary: 'Dodge traps on the way out of school. Run solo against the clock or share a keyboard to race another player through the hallways.',
    localControls: 'Player one moves with WASD, jumps with Space and runs with left Shift. Player two uses the arrows, L to jump and K to run.',
  },
  {
    slug: 'cities-game', embedId: '0z6ub9z770iru1io7cmgxogjjq05gb8q',
    developer: 'RandomGames', mobile: true,
    summary: 'Keep the city-name chain going. Each answer must start with the last letter of the previous city. Skipping a turn costs five points.',
  },
  {
    slug: 'cake-link-master', embedId: '1q8z9qiuy0tp9mjq7v5ymclf4wgxjdlb',
    developer: 'LofGames.com', mobile: true,
    summary: 'Clear pairs of matching cakes. A link can bend twice, so even two cakes far apart can match if there is a clear path between them.',
    controls: 'Select one cake, then its match. The line connecting them must go around the other tiles.',
    tip: 'Look for identical cakes side by side before tracing longer routes. In our 390 × 844 Chromium touch test, tapping an adjacent pair cleared both squares and scored 90 points.',
  },
  {
    slug: 'hyper-cakes', embedId: 'kd5fozqq3ym7hn6d0bwsjelu044sv02g',
    developer: 'Alonesher Productions', mobile: true,
    summary: 'Cut a cake to shape, spread the icing and add a texture. Place the toppings before making the final cut.',
  },
  {
    slug: 'super-football-fever', embedId: 'zbh22a4mynyf1zv90semlnszn4f9zzmn',
    developer: 'Raccoon', mobile: true,
    summary: 'Play a short football match with passing, tackling and shooting. A local duel mode lets two players face each other.',
  },
  {
    slug: 'obby-jigsaw', embedId: 'corjd98b28gf4jaterusht0imrep0gcp',
    developer: 'New Kids Games', mobile: true,
    summary: 'Pick one of twelve Obby pictures and choose how many pieces to assemble. Turn on piece rotation for an extra challenge, or show the background picture as a guide.',
  },
  {
    slug: 'annoying-boss-game', embedId: 'rsdggmqp6nyh80aol8cjwy6kw3k7m9w7',
    developer: 'Terafort US LLC', mobile: true,
    summary: 'A slapstick office game with water balloons, flying shoes and exaggerated reactions. Chain clicks to build a combo.',
  },
  {
    slug: 'harvest-glam', embedId: 'dzrrj6ge0x1m20bc5bo0iqx4g1pklmsr',
    developer: 'Prinxy', mobile: true,
    summary: 'Put together an autumn look, from makeup and hair to clothing and accessories. Click an item on desktop or tap it on a phone to try it on.',
  },
  {
    slug: 'ball-sort-master-3d', embedId: 'bgl5ee9biz9th9pgn183erv5iitx1n40',
    developer: 'SKY HIGH STUDIO', mobile: true,
    summary: 'Sort the colored balls in this 3D puzzle. Click or tap to make your selections.',
  },
  {
    slug: 'city-taxi-driving', embedId: 'vk7w0akro0ztbmmbv6f1uj46ka3ayfnj',
    developer: 'GAME DEV STUDIO (PRIVATE) LIMITED', mobile: false,
    summary: 'Drive through city traffic to pick up passengers and take each fare to its destination.',
    controls: 'Press W or the up arrow to accelerate. Use S or the down arrow to brake or reverse. Steer with A and D or the left and right arrows.',
  },
  {
    slug: 'animals-brick', embedId: 'zgvgg20y7ifbmesdc78gkooh8o1u1rmz',
    developer: 'PhongChill', mobile: true,
    summary: 'Choose animal tiles in groups of three. The tray has seven slots, so a third match can free up the space you need for your next move.',
  },
  {
    slug: 'gun-trigger', embedId: 'xmu0fc4bjhkkil2jmk2lt73x2b51gibi',
    developer: 'HyperJoy Games', mobile: true,
    summary: 'Your character flips in slow motion. Time a tap or click to hit the on-screen targets and finish the level.',
  },
  {
    slug: 'brainrot-mega-parkour', embedId: 'r9yx8ulb0fn1r6orzjwafrgclw9as23o',
    developer: 'gameVgames', mobile: true,
    summary: 'Race through trap courses or try to stay ahead of rising lava. Two players can take on the parkour courses on one keyboard.',
    localControls: 'Player one uses WASD to move, Shift to sprint and Space to jump. Player two moves with the arrows, sprints with K and jumps with L. Press the jump key twice for a double jump.',
  },
  {
    slug: 'neon-circuit-rush', embedId: '1tc3zjj6vqzbv6ldbulffu0j99lx3n2i',
    developer: 'OviGames', mobile: false,
    summary: 'Choose a car and take it onto a 3D track. Races award coins you can spend in the shop.',
    controls: 'Steer with A and D. The up arrow accelerates and the down arrow brakes.',
  },
  {
    slug: 'misregister', embedId: 'jppnp6yrfdq164517p8cm9973ut3sk6f',
    developer: 'MrHorfen', mobile: true,
    summary: 'Match ink bubbles across the four faces of a rotating block. A shot can wrap around a corner and complete a group on the next face.',
    controls: 'Drag to aim and release to shoot. Use A and D to turn the block, or tap the TURN buttons on a touchscreen.',
  },
  {
    slug: 'boombitzbomb-chips', embedId: 'k8qxib577wcjptysu95z3odi71yy1img',
    developer: 'GAME DEV STUDIO (PRIVATE) LIMITED', mobile: false,
    sourceSlug: 'boombitz-bomb-chips',
    summary: 'Match colored chips and use the chain reactions to clear the puzzle board.',
    controls: 'Move the selection with the arrow keys and confirm with Space or Enter. You can also click a chip directly.',
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
    source: record ? `https://gamemonetize.com/${record.sourceSlug ?? record.slug}-game` : null,
  };
}
