import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/constants';
import { isPreviewDeployment } from '@/lib/siteUrl';

export default function robots(): MetadataRoute.Robots {
  if (isPreviewDeployment) return { rules: { userAgent: '*', disallow: '/' } };
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin', '/api'] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
