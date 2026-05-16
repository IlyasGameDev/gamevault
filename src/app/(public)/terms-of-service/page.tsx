import type { Metadata } from 'next';
import LegalPage from '@/components/layout/LegalPage';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Read the terms that apply to using YoPlayables and its browser game platform.',
  alternates: {
    canonical: '/terms-of-service',
  },
};

export default function TermsOfServicePage() {
  return (
    <LegalPage
      eyebrow="Terms of Service"
      title="Rules for using YoPlayables"
      intro="These Terms of Service govern your access to and use of YoPlayables. By using the site, you agree to follow these terms."
    >
      <section>
        <h2 className="text-xl font-bold text-white">Using the service</h2>
        <p className="mt-3">
          You may use YoPlayables only in a lawful manner and in accordance with these terms. You agree not to misuse the site, interfere with its operation, attempt unauthorized access, or use the platform to distribute harmful content or code.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white">Accounts</h2>
        <p className="mt-3">
          If you create an account, you are responsible for the accuracy of your information and for maintaining the security of your login credentials. You are also responsible for activity that occurs under your account.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white">Content and availability</h2>
        <p className="mt-3">
          We may update, remove, suspend, or change games, features, and content at any time. We do not guarantee that all content will always be available, error-free, or compatible with every device.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white">Intellectual property</h2>
        <p className="mt-3">
          The YoPlayables brand, site design, and original platform materials are protected by applicable intellectual property laws. Game content, trademarks, and related materials may belong to their respective owners.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white">Disclaimer and limitation of liability</h2>
        <p className="mt-3">
          YoPlayables is provided on an &quot;as is&quot; and &quot;as available&quot; basis. To the fullest extent permitted by law, we disclaim warranties of any kind and are not liable for indirect, incidental, special, or consequential damages arising from your use of the service.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white">Contact</h2>
        <p className="mt-3">
          Questions about these terms can be sent to{' '}
          <a href="mailto:contact@yoplayables.com" className="text-[#B7AEFF] transition-colors hover:text-white">
            contact@yoplayables.com
          </a>.
        </p>
      </section>
    </LegalPage>
  );
}
