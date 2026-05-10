import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { game_id } = await request.json();
    if (!game_id) return NextResponse.json({ error: 'game_id required' }, { status: 400 });

    await supabaseAdmin.rpc('increment_play_count', { game_uuid: game_id });

    // Log to play_history if user is logged in
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('play_history').insert({ game_id, user_id: user.id });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // non-critical, don't fail the client
  }
}
