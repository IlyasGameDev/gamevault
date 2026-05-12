import { supabaseAdmin } from '@/lib/supabase/admin';
import { Category } from '@/lib/types/database';
import ImportClient from './ImportClient';

export const metadata = { title: 'Import Games — Admin' };

async function getCategories(): Promise<Category[]> {
  const { data } = await supabaseAdmin.from('categories').select('*').order('display_order');
  return data ?? [];
}

export default async function ImportPage() {
  const categories = await getCategories();
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Import from GameMonetize</h1>
        <p className="text-gray-400 mt-1 text-sm">
          Browse the feed, map categories to yours, then bulk-import games in one click.
        </p>
      </div>
      <ImportClient categories={categories} />
    </div>
  );
}
