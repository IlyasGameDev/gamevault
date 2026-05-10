import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { MAX_UPLOAD_SIZE_MB } from '@/lib/constants';
import AdmZip from 'adm-zip';

async function isAdmin(request: NextRequest): Promise<boolean> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  return profile?.role === 'admin';
}

export async function POST(request: NextRequest) {
  try {
    if (!await isAdmin(request)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

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

    // Handle ZIP upload for hosted games
    if (fileType === 'game' && file.name.endsWith('.zip')) {
      return await handleZipUpload(buffer, gameSlug);
    }

    // Handle image uploads (thumbnail / cover)
    let path = '';
    if (fileType === 'thumbnail') {
      path = `thumbnails/${gameSlug}/${Date.now()}_${file.name}`;
    } else if (fileType === 'cover') {
      path = `covers/${gameSlug}/${Date.now()}_${file.name}`;
    } else {
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

async function handleZipUpload(buffer: Buffer, gameSlug: string) {
  const zip = new AdmZip(buffer);
  const entries = zip.getEntries();

  const uploadedFiles: string[] = [];
  let entryFile = 'index.html';
  let hasHtml = false;

  // Detect if all files share a common root directory
  const topDirs = new Set(entries.filter((e) => !e.isDirectory).map((e) => e.entryName.split('/')[0]));
  const hasCommonRoot = topDirs.size === 1 && entries.some((e) => e.isDirectory && e.entryName.split('/')[0] === [...topDirs][0]);

  for (const entry of entries) {
    if (entry.isDirectory) continue;

    let relativePath = entry.entryName;
    if (hasCommonRoot) {
      // Strip leading directory
      relativePath = relativePath.substring(relativePath.indexOf('/') + 1);
    }
    if (!relativePath) continue;

    const fileBuffer = entry.getData();
    const storagePath = `games/${gameSlug}/${relativePath}`;
    const contentType = getContentType(relativePath);

    const { error } = await supabaseAdmin.storage.from('games').upload(storagePath, fileBuffer, {
      contentType,
      upsert: true,
    });

    if (error) throw new Error(`Failed to upload ${relativePath}: ${error.message}`);
    uploadedFiles.push(relativePath);

    if (relativePath.toLowerCase() === 'index.html') {
      hasHtml = true;
      entryFile = 'index.html';
    } else if (!hasHtml && relativePath.toLowerCase().endsWith('.html')) {
      hasHtml = true;
      entryFile = relativePath;
    }
  }

  if (!hasHtml) {
    return NextResponse.json({ error: 'ZIP must contain at least one HTML file' }, { status: 400 });
  }

  const { data: { publicUrl } } = supabaseAdmin.storage.from('games').getPublicUrl(`games/${gameSlug}/${entryFile}`);

  return NextResponse.json({
    data: {
      path: gameSlug,
      entry_file: entryFile,
      url: publicUrl,
      files: uploadedFiles,
    },
  });
}

function getContentType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  const map: Record<string, string> = {
    html: 'text/html', js: 'application/javascript', css: 'text/css',
    png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
    gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml',
    wasm: 'application/wasm', json: 'application/json',
    mp3: 'audio/mpeg', ogg: 'audio/ogg', wav: 'audio/wav',
    mp4: 'video/mp4', webm: 'video/webm',
    ttf: 'font/ttf', woff: 'font/woff', woff2: 'font/woff2',
    ico: 'image/x-icon', data: 'application/octet-stream',
  };
  return map[ext] ?? 'application/octet-stream';
}
