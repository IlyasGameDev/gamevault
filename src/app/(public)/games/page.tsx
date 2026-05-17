import type { Metadata } from 'next';
import GamesClient from './GamesClient';

export const metadata: Metadata = {
  title: 'Browse Games',
  description: 'Browse free online browser games on YoPlayables. Explore popular, new, top-rated, and category-specific games with no download required.',
  alternates: {
    canonical: '/games',
  },
  openGraph: {
    title: 'Browse Games',
    description: 'Browse free online browser games on YoPlayables. Explore popular, new, top-rated, and category-specific games with no download required.',
    url: '/games',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Browse Games',
    description: 'Browse free online browser games on YoPlayables. Explore popular, new, top-rated, and category-specific games with no download required.',
  },
};

export default function GamesPage() {
  return <GamesClient />;
}
