import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/rateLimit';
import { reactionQuerySchema, reactionSchema } from '@/lib/validations';

const VISITOR_COOKIE = 'gamevault_visitor_id';
const VISITOR_MAX_AGE = 60 * 60 * 24 * 365;

type ViewerReaction = 'like' | 'dislike' | null;

interface ReactionCounts {
  likes: number;
  dislikes: number;
  viewerReaction: ViewerReaction;
}

export async function GET(request: NextRequest) {
  try {
    const parsed = reactionQuerySchema.safeParse({
      game_id: request.nextUrl.searchParams.get('game_id'),
    });
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? parsed.error.message }, { status: 400 });
    }

    const identity = await getReactionIdentity(request);
    const counts = await getReactionCounts(parsed.data.game_id, identity.voterKey);
    return withVisitorCookie(NextResponse.json(counts, { headers: noStoreHeaders() }), identity);
  } catch (err: unknown) {
    return NextResponse.json({ error: getErrorMessage(err, 'Failed to load reactions') }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = reactionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? parsed.error.message }, { status: 400 });
    }

    const identity = await getReactionIdentity(request);
    const { allowed } = rateLimit(`reaction:${identity.voterKey}`, { limit: 40, windowMs: 60_000 });
    if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const { game_id, reaction } = parsed.data;

    if (reaction === null) {
      const { error } = await supabaseAdmin
        .from('game_reactions')
        .delete()
        .eq('game_id', game_id)
        .eq('voter_key', identity.voterKey);
      if (error) throw error;
    } else {
      const { error } = await supabaseAdmin
        .from('game_reactions')
        .upsert(
          {
            game_id,
            user_id: identity.userId,
            visitor_id: identity.visitorId,
            voter_key: identity.voterKey,
            reaction,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'game_id,voter_key' }
        );
      if (error) throw error;
    }

    const counts = await getReactionCounts(game_id, identity.voterKey);
    return withVisitorCookie(NextResponse.json(counts, { headers: noStoreHeaders() }), identity);
  } catch (err: unknown) {
    return NextResponse.json({ error: getErrorMessage(err, 'Failed to save reaction') }, { status: 500 });
  }
}

async function getReactionIdentity(request: NextRequest) {
  const existingVisitorId = request.cookies.get(VISITOR_COOKIE)?.value;
  const visitorId = isUuid(existingVisitorId) ? existingVisitorId : crypto.randomUUID();
  const isNewVisitor = visitorId !== existingVisitorId;

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id ?? null;
  const voterKey = userId ? `user:${userId}` : `visitor:${visitorId}`;

  return { visitorId, isNewVisitor, userId, voterKey };
}

async function getReactionCounts(gameId: string, voterKey: string): Promise<ReactionCounts> {
  const [likesResult, dislikesResult, viewerResult] = await Promise.all([
    supabaseAdmin
      .from('game_reactions')
      .select('id', { count: 'exact', head: true })
      .eq('game_id', gameId)
      .eq('reaction', 'like'),
    supabaseAdmin
      .from('game_reactions')
      .select('id', { count: 'exact', head: true })
      .eq('game_id', gameId)
      .eq('reaction', 'dislike'),
    supabaseAdmin
      .from('game_reactions')
      .select('reaction')
      .eq('game_id', gameId)
      .eq('voter_key', voterKey)
      .maybeSingle(),
  ]);

  if (likesResult.error) throw likesResult.error;
  if (dislikesResult.error) throw dislikesResult.error;
  if (viewerResult.error) throw viewerResult.error;

  return {
    likes: likesResult.count ?? 0,
    dislikes: dislikesResult.count ?? 0,
    viewerReaction: (viewerResult.data?.reaction as ViewerReaction | undefined) ?? null,
  };
}

function withVisitorCookie(
  response: NextResponse,
  identity: { visitorId: string; isNewVisitor: boolean }
) {
  if (identity.isNewVisitor) {
    response.cookies.set(VISITOR_COOKIE, identity.visitorId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: VISITOR_MAX_AGE,
    });
  }
  return response;
}

function noStoreHeaders() {
  return { 'Cache-Control': 'no-store, max-age=0' };
}

function isUuid(value: string | undefined): value is string {
  return !!value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function getErrorMessage(err: unknown, fallback: string) {
  if (err instanceof Error) return err.message;
  if (typeof err === 'object' && err && 'message' in err && typeof err.message === 'string') {
    return err.message;
  }
  return fallback;
}
