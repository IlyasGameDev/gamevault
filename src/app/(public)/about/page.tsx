import type { Metadata } from 'next';
import LegalPage from '@/components/layout/LegalPage';

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about YoPlayables and how the platform makes browser games easy to discover and play.',
  alternates: {
    canonical: '/about',
  },
};

export default function AboutPage() {
  return (
    <LegalPage
      eyebrow="About YoPlayables"
      title="A simple place to play browser games instantly"
      intro="YoPlayables helps players jump straight into free browser games without downloads, installs, or extra friction. We focus on making game discovery fast, approachable, and mobile-friendly."
    >
      <section>
        <h2 className="text-xl font-bold text-white">What we do</h2>
        <p className="mt-3">
          YoPlayables curates online games that can be played right in the browser. Our goal is to make it easy to find something fun quickly, whether you want a short arcade session, a puzzle break, or a longer play session on desktop or mobile.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white">What matters to us</h2>
        <p className="mt-3">
          We care about fast loading pages, clear game information, and a browsing experience that feels lightweight and enjoyable. We aim to keep the platform simple so the focus stays on playing.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white">Contact</h2>
        <p className="mt-3">
          For general questions, business inquiries, or policy requests, contact us at{' '}
          <a href="mailto:contact@yoplayables.com" className="text-[#B7AEFF] transition-colors hover:text-white">
            contact@yoplayables.com
          </a>.
        </p>
      </section>
    </LegalPage>
  );
}
