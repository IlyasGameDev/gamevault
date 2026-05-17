import type { Metadata } from 'next';
import SearchClient from './SearchClient';

export const metadata: Metadata = {
  title: 'Search Games',
  description: 'Search the YoPlayables catalog to find free browser games by title, genre, category, or gameplay style.',
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: '/search',
  },
};

export default function SearchPage() {
  return <SearchClient />;
}
