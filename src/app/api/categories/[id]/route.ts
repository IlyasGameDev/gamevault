import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { categorySchema } from '@/lib/validations';

type Params = { params: Promise<{ id: string }> };

async function requireAdmin(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  return profile?.role === 'admin' ? user : null;
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const admin = await requireAdmin(request);
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const parsed = categorySchema.partial().safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from('categories').update(parsed.data).eq('id', id).select().single();
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const admin = await requireAdmin(request);
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { count } = await supabaseAdmin
      .from('game_categories').select('*', { count: 'exact', head: true }).eq('category_id', id);

    if ((count ?? 0) > 0) {
      return NextResponse.json(
        { error: `Cannot delete: ${count} game(s) are assigned to this category. Remove them first.` },
        { status: 409 }
      );
    }

    const { error } = await supabaseAdmin.from('categories').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ message: 'Category deleted' });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 });
  }
}
