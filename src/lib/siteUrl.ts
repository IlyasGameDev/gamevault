const FALLBACK_SITE_URL = 'http://localhost:3000';
const PRODUCTION_SITE_URL = 'https://www.yoplayables.com';

export function getConfiguredSiteUrl() {
  const siteUrl = stripTrailingSlash(process.env.NEXT_PUBLIC_SITE_URL || FALLBACK_SITE_URL);
  return isVercelPreviewUrl(siteUrl) ? PRODUCTION_SITE_URL : siteUrl;
}

export function getRequestOrigin(requestUrl: string) {
  return stripTrailingSlash(new URL(requestUrl).origin);
}

export function getAuthRedirectBase(requestUrl: string) {
  const configuredSiteUrl = getConfiguredSiteUrl();
  const requestOrigin = getRequestOrigin(requestUrl);

  if (isVercelPreviewUrl(requestOrigin)) {
    return PRODUCTION_SITE_URL;
  }

  return isLocalUrl(configuredSiteUrl) ? requestOrigin : configuredSiteUrl;
}

export function isCanonicalHost(host: string) {
  const canonicalHost = new URL(PRODUCTION_SITE_URL).hostname;
  return normalizeHost(host) === normalizeHost(canonicalHost);
}

export function shouldRedirectToCanonicalHost(host: string) {
  return isVercelHost(host) && !isCanonicalHost(host);
}

export function getProductionSiteUrl() {
  return PRODUCTION_SITE_URL;
}

function isLocalUrl(url: string) {
  const { hostname } = new URL(url);
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

function isVercelPreviewUrl(url: string) {
  return isVercelHost(new URL(url).host);
}

function isVercelHost(host: string) {
  return normalizeHost(host).endsWith('.vercel.app');
}

function stripTrailingSlash(url: string) {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

function normalizeHost(host: string) {
  return host.trim().toLowerCase().split(':')[0];
}
