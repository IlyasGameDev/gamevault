import { refreshCatalog } from '@/lib/refreshCatalog';
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { gameSchema } from '@/lib/validations';
import slugify from 'slugify';
import { getCatalogPage } from '@/lib/games';
import { archiveSort, GAMES_PER_PAGE } from '@/lib/constants';
import { submitGameUrlsToIndexNow } from '@/lib/indexNow';
import { sanitize } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') ?? '1');
    const sort = searchParams.get('sort') ?? 'newest';
    const status = searchParams.get('status') ?? 'published';
    const search = searchParams.get('q') ?? '';
    const category = searchParams.get('category') ?? '';
    const limit = Math.min(parseInt(searchParams.get('limit') ?? String(GAMES_PER_PAGE)), 200);
    const { games, count } = await getCatalogPage({ page, limit, sort: archiveSort(sort), category, search }, status);
    return NextResponse.json({ data: games, count, page });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const parsed = gameSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? parsed.error.message }, { status: 400 });

    const { category_ids, ...gameData } = parsed.data;
    const slug = gameData.slug || slugify(gameData.title, { lower: true, strict: true });

    const { data: game, error } = await supabaseAdmin
      .from('games')
      .insert({
        ...gameData,
        title: sanitize(gameData.title),
        description: gameData.description ? sanitize(gameData.description) : gameData.description,
        instructions: gameData.instructions ? sanitize(gameData.instructions) : gameData.instructions,
        slug,
        published_at: gameData.status === 'published' ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (error) throw error;

    if (category_ids?.length) {
      await supabaseAdmin.from('game_categories').insert(
        category_ids.map((id) => ({ game_id: game.id, category_id: id }))
      );
    }

    if (game.status === 'published') {
      refreshCatalog([game.slug]);
      await submitGameUrlsToIndexNow([game.slug]);
    }

    return NextResponse.json({ data: game }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create game';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
