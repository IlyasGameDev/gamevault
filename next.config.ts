import type { NextConfig } from 'next';

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://www.googletagmanager.com https://www.clarity.ms",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://*.supabase.co https://lh3.googleusercontent.com https://img.gamemonetize.com https://www.google-analytics.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net",
      // Allow iframes from any origin for embedded games
      "frame-src *",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com https://region1.google-analytics.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://www.clarity.ms",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  images: {
    minimumCacheTTL: 86400,
    formats: ['image/avif', 'image/webp'],
    qualities: [65, 75],
    deviceSizes: [360, 414, 640, 768, 1024, 1280, 1536],
    imageSizes: [32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'img.gamemonetize.com',
      },
    ],
  },
  async redirects() {
    return [
      ...['puzzle', 'action', 'racing', 'shooting', 'arcade', 'io'].map((genre) => ({
        source: `/free-${genre}-games`,
        destination: `/categories/${genre}`,
        permanent: true,
      })),
      { source: '/free-online-games', destination: '/', permanent: true },
      { source: '/free-browser-games', destination: '/games', permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*\\.(png|jpg|jpeg|gif|webp|avif|ico|svg|woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/((?!games/.*).)*',  // Apply to all pages except game player pages
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
