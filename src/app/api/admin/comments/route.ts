import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') ?? 'all';

    let query = supabaseAdmin
      .from('comments')
      .select('*, profiles(username, display_name, avatar_url), game:games(title, slug)')
      .order('created_at', { ascending: false })
      .limit(100);

    if (filter === 'flagged') query = query.eq('is_flagged', true);
    else if (filter === 'hidden') query = query.eq('is_hidden', true);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch comments';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
