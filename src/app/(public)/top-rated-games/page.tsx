import GameCollectionPage, { createCollectionMetadata, type GameCollectionConfig } from '../_components/GameCollectionPage';

const config: GameCollectionConfig = {
  title: 'Top Rated Free Online Games',
  description: 'Play top rated free online games on YoPlayables. Browse highly rated browser games with instant play and no download.',
  canonical: '/top-rated-games',
  intro: 'Games enter this list after their first player rating. Higher average scores rank first, with vote count used to break ties.',
  secondary: 'Open a game to play it or add your own rating.',
  sort: 'rated',
  icon: 'popular',
};

export const metadata = createCollectionMetadata(config);
export const revalidate = 300;

export default function TopRatedGamesPage() {
  return <GameCollectionPage config={config} />;
}
