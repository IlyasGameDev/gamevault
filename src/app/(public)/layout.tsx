import PublicChrome from '@/components/layout/PublicChrome';
import CopyProtection from '@/components/layout/CopyProtection';
import { getCategoriesWithPublishedGames } from '@/lib/categories';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const categories = await getCategoriesWithPublishedGames();

  return (
    <>
      <CopyProtection />
      <PublicChrome categories={categories}>{children}</PublicChrome>
    </>
  );
}
