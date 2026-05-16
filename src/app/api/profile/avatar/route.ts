import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { MAX_AVATAR_SIZE_MB } from '@/lib/constants';

const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

function getExtension(file: File): string {
  const ext = file.name.split('.').pop()?.toLowerCase();

  if (ext && ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
    return ext === 'jpg' ? 'jpeg' : ext;
  }

  const byType: Record<string, string> = {
    'image/jpeg': 'jpeg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  };

  return byType[file.type] ?? 'png';
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Image file is required' }, { status: 400 });
    }

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'Only JPG, PNG, WEBP, or GIF images are allowed' }, { status: 400 });
    }

    const maxBytes = MAX_AVATAR_SIZE_MB * 1024 * 1024;
    if (file.size > maxBytes) {
      return NextResponse.json({ error: `Avatar must be under ${MAX_AVATAR_SIZE_MB}MB` }, { status: 400 });
    }

    const ext = getExtension(file);
    const folder = `avatars/${user.id}`;
    const path = `${folder}/avatar.${ext}`;

    const { data: existingFiles, error: listError } = await supabaseAdmin.storage
      .from('games')
      .list(folder);

    if (listError) {
      throw new Error(listError.message);
    }

    if (existingFiles && existingFiles.length > 0) {
      const filesToRemove = existingFiles.map(({ name }) => `${folder}/${name}`);
      const { error: removeError } = await supabaseAdmin.storage.from('games').remove(filesToRemove);

      if (removeError) {
        throw new Error(removeError.message);
      }
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { error: uploadError } = await supabaseAdmin.storage.from('games').upload(path, buffer, {
      contentType: file.type,
      upsert: true,
    });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from('games').getPublicUrl(path);

    const avatarUrl = `${publicUrl}?v=${Date.now()}`;
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ avatar_url: avatarUrl })
      .eq('id', user.id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    return NextResponse.json({ data: { avatarUrl } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to upload avatar';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
