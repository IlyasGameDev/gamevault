import { supabaseAdmin } from '@/lib/supabase/admin';
import Link from 'next/link';
import { Category } from '@/lib/types/database';

export const metadata = { title: 'Categories — GameVault' };
export const revalidate = 3600;

async function getCategories() {
  const { data } = await supabaseAdmin
    .from('categories')
    .select('*')
    .order('display_order');
  return (data ?? []) as Category[];
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <h1 className="text-3xl font-bold text-white">All Categories</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/categories/${cat.slug}`}
            className="flex flex-col items-center gap-3 p-6 bg-[#1a1d2e] border border-white/5 rounded-2xl hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group"
          >
            <span className="text-4xl">{cat.icon}</span>
            <div className="text-center">
              <p className="font-semibold text-white group-hover:text-indigo-400 transition-colors">{cat.name}</p>
              {cat.description && <p className="text-xs text-gray-600 mt-1 line-clamp-2">{cat.description}</p>}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
