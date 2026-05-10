import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ratingSchema } from '@/lib/validations';
import { rateLimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // 20 ratings per minute per user
    const { allowed } = rateLimit(`rating:${user.id}`, { limit: 20, windowMs: 60_000 });
    if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const body = await request.json();
    const parsed = ratingSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? parsed.error.message }, { status: 400 });

    const { game_id, score } = parsed.data;
    const { data, error } = await supabase
      .from('ratings')
      .upsert({ game_id, user_id: user.id, score, updated_at: new Date().toISOString() }, { onConflict: 'game_id,user_id' })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to submit rating';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
