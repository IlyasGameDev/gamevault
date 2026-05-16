import type { Metadata } from 'next';
import LegalPage from '@/components/layout/LegalPage';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Read the YoPlayables privacy policy, including what information we collect and how we use it.',
  alternates: {
    canonical: '/privacy-policy',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      eyebrow="Privacy Policy"
      title="How YoPlayables handles your information"
      intro="This Privacy Policy explains what information YoPlayables may collect when you use the site, how we use it, and how to contact us with questions."
    >
      <section>
        <h2 className="text-xl font-bold text-white">Information we collect</h2>
        <p className="mt-3">
          We may collect information you provide directly, such as account details, profile information, messages you send us, and feedback you share. We may also collect technical data like device type, browser type, pages visited, gameplay activity, and basic analytics needed to operate and improve the service.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white">How we use information</h2>
        <p className="mt-3">
          We use information to run the platform, personalize your experience, maintain account features, understand site performance, prevent abuse, and improve our content and services.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white">Cookies and similar technologies</h2>
        <p className="mt-3">
          YoPlayables may use cookies or similar technologies to keep you signed in, remember preferences, measure performance, and support core site functionality. You can usually manage cookies through your browser settings.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white">Third-party services</h2>
        <p className="mt-3">
          Some games, embeds, analytics tools, or infrastructure providers may process limited information as part of delivering content through the site. Their handling of data is governed by their own policies.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white">Data retention and security</h2>
        <p className="mt-3">
          We keep information for as long as reasonably necessary to operate the service, meet legal obligations, resolve disputes, and enforce our policies. We also take reasonable measures to protect data, but no internet-based service can guarantee absolute security.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white">Contact us</h2>
        <p className="mt-3">
          If you have privacy-related questions or requests, email{' '}
          <a href="mailto:contact@yoplayables.com" className="text-[#B7AEFF] transition-colors hover:text-white">
            contact@yoplayables.com
          </a>.
        </p>
      </section>
    </LegalPage>
  );
}
