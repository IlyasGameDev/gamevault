import GameCollectionPage, { createCollectionMetadata, type GameCollectionConfig } from '../_components/GameCollectionPage';

const config: GameCollectionConfig = {
  title: 'New Free Online Games',
  description: 'Play new free online games on YoPlayables. Discover the latest browser games for desktop, tablet, and mobile with no download required.',
  canonical: '/new-games',
  intro: 'Play new free online games on YoPlayables and discover the latest browser games added to the site. These fresh HTML5 and WebGL games start instantly, with no downloads, app stores, or installs.',
  secondary: 'Browse recently added action games, racing games, puzzle games, arcade games, sports games, and casual games that work across desktop, tablet, and mobile browsers.',
  sort: 'newest',
  icon: 'new',
};

export const metadata = createCollectionMetadata(config);
export const revalidate = 300;

export default function NewGamesPage() {
  return <GameCollectionPage config={config} />;
}
