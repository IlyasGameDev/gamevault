import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { MAX_UPLOAD_SIZE_MB } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const gameSlug = formData.get('slug') as string | null;
    const fileType = formData.get('type') as string | null; // 'thumbnail' | 'cover' | 'game'

    if (!file || !gameSlug) {
      return NextResponse.json({ error: 'file and slug are required' }, { status: 400 });
    }

    const maxBytes = MAX_UPLOAD_SIZE_MB * 1024 * 1024;
    if (file.size > maxBytes) {
      return NextResponse.json({ error: `File exceeds ${MAX_UPLOAD_SIZE_MB}MB limit` }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let path = '';

    if (fileType === 'thumbnail') {
      path = `thumbnails/${gameSlug}/${Date.now()}_${file.name}`;
    } else if (fileType === 'cover') {
      path = `covers/${gameSlug}/${Date.now()}_${file.name}`;
    } else {
      // Game file (zip or individual file)
      path = `games/${gameSlug}/${file.name}`;
    }

    const { error } = await supabaseAdmin.storage.from('games').upload(path, buffer, {
      contentType: file.type,
      upsert: true,
    });

    if (error) throw error;

    const { data: { publicUrl } } = supabaseAdmin.storage.from('games').getPublicUrl(path);

    return NextResponse.json({ data: { path, url: publicUrl } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
