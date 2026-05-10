import { supabaseAdmin } from '@/lib/supabase/admin';
import GameForm from '@/components/admin/GameForm';
import { Category } from '@/lib/types/database';

export const metadata = { title: 'Add Game — Admin' };

async function getCategories(): Promise<Category[]> {
  const { data } = await supabaseAdmin.from('categories').select('*').order('display_order');
  return data ?? [];
}

export default async function NewGamePage() {
  const categories = await getCategories();
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold text-white">Add New Game</h1>
      <GameForm categories={categories} />
    </div>
  );
}
