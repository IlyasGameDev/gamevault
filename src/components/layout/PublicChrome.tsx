import Footer from '@/components/layout/Footer';
import PublicShellControls from '@/components/layout/PublicShellControls';
import { Category } from '@/lib/types/database';

export default function PublicChrome({
  categories,
  children,
}: {
  categories: Category[];
  children: React.ReactNode;
}) {
  return (
    <>
      <PublicShellControls categories={categories} />
      <div className="flex-1 md:pl-[46px]">{children}</div>
      <div className="md:pl-[46px]">
        <Footer />
      </div>
    </>
  );
}
