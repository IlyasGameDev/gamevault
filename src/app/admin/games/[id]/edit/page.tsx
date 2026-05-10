import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase/admin';
import GameForm from '@/components/admin/GameForm';
import { Category, GameWithCategories } from '@/lib/types/database';

type Props = { params: Promise<{ id: string }> };

async function getGame(id: string): Promise<GameWithCategories | null> {
  const { data } = await supabaseAdmin
    .from('games')
    .select('*, categories:game_categories(category:categories(*))')
    .eq('id', id)
    .single();
  if (!data) return null;
  return {
    ...data,
    categories: ((data.categories as { category: unknown }[]) ?? []).map((gc) => gc.category),
  } as GameWithCategories;
}

async function getCategories(): Promise<Category[]> {
  const { data } = await supabaseAdmin.from('categories').select('*').order('display_order');
  return data ?? [];
}

export default async function EditGamePage({ params }: Props) {
  const { id } = await params;
  const [game, categories] = await Promise.all([getGame(id), getCategories()]);
  if (!game) notFound();

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold text-white">Edit: {game.title}</h1>
      <GameForm game={game} categories={categories} />
    </div>
  );
}
