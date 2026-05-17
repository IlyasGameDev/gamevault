import GameCollectionPage, { createCollectionMetadata, type GameCollectionConfig } from '../_components/GameCollectionPage';

const config: GameCollectionConfig = {
  title: 'Popular Free Online Games',
  description: 'Play popular free online games on YoPlayables. Find trending browser games with instant play and no download on desktop or mobile.',
  canonical: '/popular-games',
  intro: 'Play popular free online games on YoPlayables and jump into browser games that players are choosing most often. This collection highlights trending HTML5 and WebGL games that open instantly.',
  secondary: 'Find popular action, racing, puzzle, arcade, shooting, sports, and multiplayer games for quick sessions on desktop, tablet, and mobile without installing anything.',
  sort: 'popular',
  icon: 'hot',
};

export const metadata = createCollectionMetadata(config);
export const revalidate = 300;

export default function PopularGamesPage() {
  return <GameCollectionPage config={config} />;
}
