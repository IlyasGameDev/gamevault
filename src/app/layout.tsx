import type { Metadata } from 'next';
import { Bricolage_Grotesque, Space_Mono } from 'next/font/google';
import './globals.css';
import ToastProvider from '@/components/ui/Toast';
import { SITE_NAME, SITE_DESCRIPTION } from '@/lib/constants';

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  display: 'swap',
});
const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: SITE_NAME, template: `%s — ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bricolage.variable} ${spaceMono.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[#FFF8E6] text-[#0E1547] antialiased">
        <ToastProvider />
        <div className="flex-1">{children}</div>
      </body>
    </html>
  );
}
