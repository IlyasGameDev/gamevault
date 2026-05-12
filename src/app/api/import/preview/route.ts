import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

interface FeedGame {
  id: string;
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

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') ?? '1';

    const feedRes = await fetch(`https://gamemonetize.com/feed.php?format=0&page=${page}`, {
      next: { revalidate: 0 },
    });
    if (!feedRes.ok) throw new Error('Failed to fetch GameMonetize feed');

    const feedData = await feedRes.json();
    const games: FeedGame[] = feedData.games ?? feedData ?? [];

    if (!games.length) {
      return NextResponse.json({ data: [] });
    }

    const urls = games.map((g) => g.url);
    const { data: existing } = await supabaseAdmin
      .from('games')
      .select('iframe_url')
      .in('iframe_url', urls);

    const existingUrls = new Set((existing ?? []).map((g) => g.iframe_url));

    return NextResponse.json({
      data: games.map((g) => ({ ...g, isDuplicate: existingUrls.has(g.url) })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch feed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
