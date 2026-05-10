import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const [gamesRes, usersRes, playsRes, commentsRes] = await Promise.all([
      supabaseAdmin.from('games').select('status'),
      supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('play_history').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('comments').select('is_flagged'),
    ]);

    const games = gamesRes.data ?? [];
    const stats = {
      total_games: games.length,
      published_games: games.filter((g) => g.status === 'published').length,
      draft_games: games.filter((g) => g.status === 'draft').length,
      archived_games: games.filter((g) => g.status === 'archived').length,
      total_users: usersRes.count ?? 0,
      total_plays: playsRes.count ?? 0,
      total_comments: (commentsRes.data ?? []).length,
      flagged_comments: (commentsRes.data ?? []).filter((c) => c.is_flagged).length,
    };

    return NextResponse.json({ data: stats });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch stats';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
