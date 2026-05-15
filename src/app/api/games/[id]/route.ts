import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { gameSchema } from '@/lib/validations';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { data, error } = await supabaseAdmin
      .from('games')
      .select('*, categories:game_categories(category:categories(*))')
      .eq('id', id)
      .single();

    if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const game = {
      ...data,
      categories: ((data.categories as { category: unknown }[]) ?? []).map((gc) => gc.category),
    };
    return NextResponse.json({ data: game });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch game' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const parsed = gameSchema.partial().safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? parsed.error.message }, { status: 400 });

    const submittedKeys = new Set(Object.keys(body));
    const updateData = Object.fromEntries(
      Object.entries(parsed.data).filter(([key]) => submittedKeys.has(key))
    ) as typeof parsed.data;
    const { category_ids, ...gameData } = updateData;

    const { data: existing } = await supabaseAdmin.from('games').select('status').eq('id', id).single();
    const wasPublished = existing?.status === 'published';
    const nowPublished = gameData.status === 'published';

    const { data: game, error } = await supabaseAdmin
      .from('games')
      .update({
        ...gameData,
        published_at: !wasPublished && nowPublished ? new Date().toISOString() : undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (category_ids !== undefined) {
      await supabaseAdmin.from('game_categories').delete().eq('game_id', id);
      if (category_ids.length) {
        await supabaseAdmin.from('game_categories').insert(
          category_ids.map((cid) => ({ game_id: id, category_id: cid }))
        );
      }
    }

    return NextResponse.json({ data: game });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update game';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { error } = await supabaseAdmin.from('games').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ message: 'Game deleted' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete game';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
