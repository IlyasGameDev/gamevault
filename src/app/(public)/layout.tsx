import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CategorySidebar from '@/components/layout/CategorySidebar';
import { getCategoriesWithPublishedGames } from '@/lib/categories';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const categories = await getCategoriesWithPublishedGames();

  return (
    <>
      <Navbar categories={categories} />
      <CategorySidebar categories={categories} />
      <div className="flex-1 md:pl-[46px]">{children}</div>
      <div className="md:pl-[46px]">
        <Footer />
      </div>
    </>
  );
}
