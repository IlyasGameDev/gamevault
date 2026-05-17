import GameCollectionPage, { createCollectionMetadata, type GameCollectionConfig } from '../_components/GameCollectionPage';

const config: GameCollectionConfig = {
  title: 'Top Rated Free Online Games',
  description: 'Play top rated free online games on YoPlayables. Browse highly rated browser games with instant play and no download.',
  canonical: '/top-rated-games',
  intro: 'Play top rated free online games on YoPlayables and explore browser games with strong player ratings. These HTML5 and WebGL picks are easy to start and built for instant play.',
  secondary: 'Browse highly rated action games, puzzle games, racing games, arcade games, sports games, and casual games that run directly in modern desktop and mobile browsers.',
  sort: 'rated',
  icon: 'popular',
};

export const metadata = createCollectionMetadata(config);
export const revalidate = 300;

export default function TopRatedGamesPage() {
  return <GameCollectionPage config={config} />;
}
