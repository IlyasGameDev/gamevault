const FALLBACK_SITE_URL = 'http://localhost:3000';

export function getConfiguredSiteUrl() {
  return stripTrailingSlash(process.env.NEXT_PUBLIC_SITE_URL || FALLBACK_SITE_URL);
}

export function getRequestOrigin(requestUrl: string) {
  return stripTrailingSlash(new URL(requestUrl).origin);
}

export function getAuthRedirectBase(requestUrl: string) {
  const configuredSiteUrl = getConfiguredSiteUrl();
  return isLocalUrl(configuredSiteUrl) ? getRequestOrigin(requestUrl) : configuredSiteUrl;
}

export function isCanonicalHost(host: string) {
  const canonicalHost = new URL(getConfiguredSiteUrl()).host;
  return normalizeHost(host) === normalizeHost(canonicalHost);
}

export function shouldRedirectToCanonicalHost(host: string) {
  const configuredSiteUrl = getConfiguredSiteUrl();
  return !isLocalUrl(configuredSiteUrl)
    && host.endsWith('.vercel.app')
    && !isCanonicalHost(host);
}

function isLocalUrl(url: string) {
  const { hostname } = new URL(url);
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

function stripTrailingSlash(url: string) {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

function normalizeHost(host: string) {
  return host.trim().toLowerCase();
}
