import { SITE_URL } from '@/lib/constants';

const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
const INDEXNOW_KEY_PATTERN = /^[A-Za-z0-9-]{8,128}$/;
const REQUEST_TIMEOUT_MS = 4000;

export function getIndexNowKey() {
  const key = process.env.INDEXNOW_KEY?.trim();
  return key && INDEXNOW_KEY_PATTERN.test(key) ? key : null;
}

export function getIndexNowKeyPath() {
  const key = getIndexNowKey();
  return key ? `/${key}.txt` : null;
}

export function getIndexNowKeyLocation() {
  const keyPath = getIndexNowKeyPath();
  return keyPath ? `${SITE_URL}${keyPath}` : null;
}

export function getGameIndexNowUrl(slug: string) {
  return `${SITE_URL}/games/${encodeURIComponent(slug)}`;
}

export async function submitGameUrlsToIndexNow(slugs: string[]) {
  return submitIndexNowUrls(slugs.map(getGameIndexNowUrl));
}

export async function submitIndexNowUrls(urls: string[]) {
  const key = getIndexNowKey();
  const keyLocation = getIndexNowKeyLocation();
  const siteUrl = new URL(SITE_URL);

  if (!key || !keyLocation || isLocalHost(siteUrl.hostname)) {
    return;
  }

  const urlList = Array.from(new Set(urls))
    .filter((url) => belongsToSiteHost(url, siteUrl.host))
    .slice(0, 10000);

  if (!urlList.length) {
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: siteUrl.host,
        key,
        keyLocation,
        urlList,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      console.warn(`[indexnow] submission failed with status ${response.status}`);
    }
  } catch (error) {
    console.warn('[indexnow] submission failed', error);
  } finally {
    clearTimeout(timeout);
  }
}

function belongsToSiteHost(url: string, host: string) {
  try {
    return new URL(url).host === host;
  } catch {
    return false;
  }
}

function isLocalHost(hostname: string) {
  return hostname === 'localhost' || hostname === '127.0.0.1';
}
