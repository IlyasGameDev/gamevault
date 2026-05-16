import PublicChrome from '@/components/layout/PublicChrome';
import { getCategoriesWithPublishedGames } from '@/lib/categories';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const categories = await getCategoriesWithPublishedGames();

  return (
    <PublicChrome categories={categories}>{children}</PublicChrome>
  );
}
