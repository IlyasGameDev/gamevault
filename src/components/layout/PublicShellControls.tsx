'use client';

import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import CategorySidebar from '@/components/layout/CategorySidebar';
import ToastProvider from '@/components/ui/Toast';
import { Category } from '@/lib/types/database';

export default function PublicShellControls({ categories }: { categories: Category[] }) {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  return (
    <>
      <ToastProvider />
      <Navbar
        categories={categories}
        sidebarExpanded={sidebarExpanded}
        onToggleSidebar={() => setSidebarExpanded((value) => !value)}
      />
      <CategorySidebar categories={categories} expanded={sidebarExpanded} />
    </>
  );
}
