import type { Metadata } from 'next';
import ToastProvider from '@/components/ui/Toast';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToastProvider />
      {children}
    </>
  );
}
