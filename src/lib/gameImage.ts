// Custom game uploads can use other origins. Leave those URLs untouched.
export function canOptimizeGameImage(src: string) {
  if (src.startsWith('/') && !src.startsWith('//')) return true;
  if (!URL.canParse(src)) return false;
  const url = new URL(src);
  return url.protocol === 'https:' && !url.port && (
    url.hostname === 'img.gamemonetize.com' ||
    (url.hostname.endsWith('.supabase.co') && url.pathname.startsWith('/storage/v1/object/public/'))
  );
}
