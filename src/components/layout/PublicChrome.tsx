'use client';

import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CategorySidebar from '@/components/layout/CategorySidebar';
import { Category } from '@/lib/types/database';

export default function PublicChrome({
  categories,
  children,
}: {
  categories: Category[];
  children: React.ReactNode;
}) {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  return (
    <>
      <Navbar
        categories={categories}
        sidebarExpanded={sidebarExpanded}
        onToggleSidebar={() => setSidebarExpanded((value) => !value)}
      />
      <CategorySidebar categories={categories} expanded={sidebarExpanded} />
      <div className="flex-1 md:pl-[46px]">{children}</div>
      <div className="md:pl-[46px]">
        <Footer />
      </div>
    </>
  );
}
