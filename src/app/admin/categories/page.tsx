'use client';
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import { Category } from '@/lib/types/database';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import toast from 'react-hot-toast';
import slugify from 'slugify';

interface CategoryWithCount extends Category {
  game_count: { count: number }[];
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('');
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/categories').then((r) => r.json()).then(({ data }) => {
      setCategories(data ?? []); setLoading(false);
    });
  }, []);

  function gameCount(cat: CategoryWithCount) {
    return cat.game_count?.[0]?.count ?? 0;
  }

  async function addCategory() {
    if (!newName.trim()) return;
    setAdding(true);
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          slug: slugify(newName.trim(), { lower: true, strict: true }),
          icon: newIcon.trim() || undefined,
          display_order: categories.length + 1,
        }),
      });
      const { data, error } = await res.json();
      if (error) throw new Error(error);
      setCategories([...categories, { ...data, game_count: [{ count: 0 }] }]);
      setNewName(''); setNewIcon('');
      toast.success('Category added!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to add category');
    } finally {
      setAdding(false);
    }
  }

  function startEdit(cat: CategoryWithCount) {
    setEditingId(cat.id);
    setEditName(cat.name);
  }

  async function saveEdit(cat: CategoryWithCount) {
    try {
      const res = await fetch(`/api/categories/${cat.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, slug: slugify(editName, { lower: true, strict: true }) }),
      });
      const { error } = await res.json();
      if (error) throw new Error(error);
      setCategories(categories.map((c) => c.id === cat.id ? { ...c, name: editName } : c));
      setEditingId(null);
      toast.success('Updated!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update');
    }
  }

  async function deleteCategory(cat: CategoryWithCount) {
    const count = gameCount(cat);
    if (count > 0) {
      toast.error(`Cannot delete "${cat.name}" — ${count} game(s) assigned. Remove them first.`);
      return;
    }
    if (!confirm(`Delete category "${cat.name}"?`)) return;
    setDeletingId(cat.id);
    try {
      const res = await fetch(`/api/categories/${cat.id}`, { method: 'DELETE' });
      const { error } = await res.json();
      if (error) throw new Error(error);
      setCategories(categories.filter((c) => c.id !== cat.id));
      toast.success('Category deleted');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold text-white">Categories</h1>

      <div className="bg-[#1a1d2e] rounded-xl p-6 border border-white/10 space-y-4">
        <h2 className="font-semibold text-white">Add Category</h2>
        <div className="flex gap-3">
          <Input value={newIcon} onChange={(e) => setNewIcon(e.target.value)} placeholder="Icon (emoji)" className="w-28" />
          <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Category name" className="flex-1"
            onKeyDown={(e) => { if (e.key === 'Enter') addCategory(); }} />
          <Button onClick={addCategory} loading={adding}><Plus size={16} /> Add</Button>
        </div>
      </div>

      <div className="bg-[#1a1d2e] rounded-xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-white/10">
              <tr className="text-left">
                <th className="px-6 py-4 text-gray-500 font-medium">Icon</th>
                <th className="px-6 py-4 text-gray-500 font-medium">Name</th>
                <th className="px-6 py-4 text-gray-500 font-medium">Slug</th>
                <th className="px-6 py-4 text-gray-500 font-medium">Games</th>
                <th className="px-6 py-4 text-gray-500 font-medium">Order</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-white/5">
                  <td className="px-6 py-4 text-xl">{cat.icon}</td>
                  <td className="px-6 py-4">
                    {editingId === cat.id ? (
                      <div className="flex gap-2 items-center">
                        <input value={editName} onChange={(e) => setEditName(e.target.value)}
                          className="px-2 py-1 bg-[#252840] border border-white/10 rounded text-white text-sm focus:outline-none focus:border-indigo-500 w-40" />
                        <button onClick={() => saveEdit(cat)} className="text-emerald-400 hover:text-emerald-300"><Check size={14} /></button>
                        <button onClick={() => setEditingId(null)} className="text-gray-500 hover:text-white"><X size={14} /></button>
                      </div>
                    ) : (
                      <span className="font-medium text-white">{cat.name}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-500">{cat.slug}</td>
                  <td className="px-6 py-4">
                    <Badge variant={gameCount(cat) > 0 ? 'blue' : 'default'}>{gameCount(cat)} games</Badge>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{cat.display_order}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      <button onClick={() => startEdit(cat)}
                        className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => deleteCategory(cat)}
                        disabled={deletingId === cat.id}
                        className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
