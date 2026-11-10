import { refreshCatalog } from '@/lib/refreshCatalog';
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { submitGameUrlsToIndexNow } from '@/lib/indexNow';
import { gameText } from '@/lib/gameText';
import { gameFacts } from '@/lib/gameFacts';
import slugify from 'slugify';

interface FeedGame {
  title: string;
  description: string;
  instructions: string;
  url: string;
  category: string;
  tags: string;
  thumb: string;
  width: string;
  height: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const { games, categoryMap, status = 'published' }: {
      games: FeedGame[];
      categoryMap: Record<string, string>;
      status: 'draft' | 'published';
    } = body;

    if (!games?.length) return NextResponse.json({ error: 'No games provided' }, { status: 400 });

    // The catalog can exceed PostgREST's maximum response size.
    const existingSlugs = new Set<string>();
    const existingUrls = new Set<string>();
    let after: string | undefined;
    while (true) {
      let query = supabaseAdmin.from('games').select('slug, iframe_url').order('slug').limit(1000);
      if (after) query = query.gt('slug', after);
      const { data, error } = await query;
      if (error) throw error;
      if (!data?.length) break;
      for (const row of data) {
        existingSlugs.add(row.slug);
        if (row.iframe_url) existingUrls.add(row.iframe_url);
      }
      after = data[data.length - 1].slug;
    }

    let imported = 0;
    let skipped = 0;
    const publishedSlugs: string[] = [];
    const errors: string[] = [];

    for (const game of games) {
      if (existingUrls.has(game.url)) {
        skipped++;
        continue;
      }

      const categoryId = categoryMap[game.category];
      if (!categoryId) {
        errors.push(`No category mapped for "${game.category}" — skipped "${game.title}"`);
        skipped++;
        continue;
      }

      const title = gameText(game.title);
      const baseSlug = slugify(title, { lower: true, strict: true });
      let slug = baseSlug;
      let i = 1;
      while (existingSlugs.has(slug)) {
        slug = `${baseSlug}-${i++}`;
      }
      existingSlugs.add(slug);

      const width = parseInt(game.width) || 800;
      const height = parseInt(game.height) || 600;

      const { data: inserted, error } = await supabaseAdmin
        .from('games')
        .insert({
          title,
          slug,
          description: gameText(game.description || '') || null,
          instructions: gameText(game.instructions || '') || null,
          game_type: 'iframe',
          iframe_url: game.url,
          thumbnail_url: game.thumb || null,
          tags: game.tags ? game.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
          width,
          height,
          orientation: width >= height ? 'landscape' : 'portrait',
          status,
          is_featured: false,
          game_entry_file: 'index.html',
          published_at: status === 'published' ? new Date().toISOString() : null,
          developer: gameFacts({ iframe_url: game.url, developer: null, developer_url: null }).developer ?? null,
        })
        .select('id')
        .single();

      if (error) {
        console.error(`[import] insert failed for "${game.title}":`, error);
        errors.push(`Failed to insert "${game.title}": ${error.message}`);
        skipped++;
        continue;
      }

      const { error: catError } = await supabaseAdmin.from('game_categories').insert({
        game_id: inserted.id,
        category_id: categoryId,
      });
      if (catError) {
        console.error(`[import] category link failed for "${game.title}":`, catError);
        errors.push(`Imported "${game.title}" but failed to link category: ${catError.message}`);
      }

      existingUrls.add(game.url);
      if (status === 'published') {
        publishedSlugs.push(slug);
      }
      imported++;
    }

    if (publishedSlugs.length) refreshCatalog(publishedSlugs);
    await submitGameUrlsToIndexNow(publishedSlugs);

    return NextResponse.json({ imported, skipped, errors });
  } catch (err) {
    const message = err instanceof Error
      ? err.message
      : (err as { message?: string })?.message ?? 'Failed to import games';
    console.error('[import] unexpected error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
