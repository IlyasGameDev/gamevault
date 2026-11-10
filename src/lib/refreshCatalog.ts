import { revalidatePath, revalidateTag } from 'next/cache';

export function refreshCatalog(slugs: string[] = []) {
  revalidateTag('games', { expire: 0 });
  revalidateTag('categories', { expire: 0 });
  revalidatePath('/sitemap.xml');
  for (const slug of new Set(slugs)) revalidatePath(`/games/${slug}`);
}
