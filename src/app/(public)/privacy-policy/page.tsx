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
          YoPlayables may use cookies, local storage, or similar technologies to keep you signed in, remember preferences, measure performance, prevent abuse, support advertising, and provide core site functionality. You can usually manage cookies through your browser settings.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white">Advertising and Google AdSense</h2>
        <p className="mt-3">
          We use Google AdSense to help support the site. Third-party vendors, including Google, use cookies to serve ads based on a user&apos;s prior visits to YoPlayables or other websites. Google&apos;s use of advertising cookies enables Google and its partners to serve ads based on visits to this site and other sites on the internet.
        </p>
        <p className="mt-3">
          You can opt out of personalized advertising by visiting{' '}
          <a href="https://adssettings.google.com" className="text-[#B7AEFF] transition-colors hover:text-white" target="_blank" rel="noopener noreferrer">
            Google Ads Settings
          </a>
          . You can also learn more about choices for third-party advertising cookies at{' '}
          <a href="https://www.aboutads.info" className="text-[#B7AEFF] transition-colors hover:text-white" target="_blank" rel="noopener noreferrer">
            aboutads.info
          </a>
          .
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white">Third-party services</h2>
        <p className="mt-3">
          Some games, embeds, advertising providers, analytics tools, or infrastructure providers may process limited information as part of delivering content through the site. This may include Google AdSense, Google Analytics, Vercel Analytics, Microsoft Clarity, Supabase, and embedded game providers such as GameMonetize. Their handling of data is governed by their own policies.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white">Regional privacy choices</h2>
        <p className="mt-3">
          Depending on where you live, privacy laws may give you rights to request access, correction, deletion, restriction, objection, or portability of personal information. Visitors in the EEA, United Kingdom, and Switzerland may also be asked for consent before certain advertising or analytics cookies are used where required by law.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white">Children&apos;s privacy</h2>
        <p className="mt-3">
          YoPlayables is intended for a general audience and is not directed to children under 13. If you believe a child has provided personal information through the site, contact us so we can review and remove it where appropriate.
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
