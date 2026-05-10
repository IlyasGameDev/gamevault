import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { commentSchema } from '@/lib/validations';
import { COMMENTS_PER_PAGE } from '@/lib/constants';
import { sanitize } from '@/lib/utils';
import { rateLimit } from '@/lib/rateLimit';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const game_id = searchParams.get('game_id');
  const page = parseInt(searchParams.get('page') ?? '1');

  if (!game_id) return NextResponse.json({ error: 'game_id required' }, { status: 400 });

  const from = (page - 1) * COMMENTS_PER_PAGE;
  const to = from + COMMENTS_PER_PAGE - 1;

  const { data, count, error } = await supabaseAdmin
    .from('comments')
    .select('*, profiles(username, display_name, avatar_url)', { count: 'exact' })
    .eq('game_id', game_id)
    .eq('is_hidden', false)
    .is('parent_id', null)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data, count });
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // 5 comments per minute per user
    const { allowed } = rateLimit(`comment:${user.id}`, { limit: 5, windowMs: 60_000 });
    if (!allowed) return NextResponse.json({ error: 'Too many comments — slow down!' }, { status: 429 });

    const body = await request.json();
    const parsed = commentSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? parsed.error.message }, { status: 400 });

    const { data, error } = await supabase
      .from('comments')
      .insert({ ...parsed.data, content: sanitize(parsed.data.content), user_id: user.id })
      .select('*, profiles(username, display_name, avatar_url)')
      .single();

    if (error) throw error;
    return NextResponse.json({ data }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to post comment';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { id, is_hidden } = await request.json();
    const { data, error } = await supabaseAdmin
      .from('comments').update({ is_hidden }).eq('id', id).select().single();

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update comment';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const { data: comment } = await supabase.from('comments').select('user_id').eq('id', id).single();
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();

    if (comment?.user_id !== user.id && profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await supabaseAdmin.from('comments').delete().eq('id', id);
    return NextResponse.json({ message: 'Comment deleted' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete comment';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
