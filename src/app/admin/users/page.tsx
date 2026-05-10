'use client';
import { useState, useEffect } from 'react';
import { Search, Shield, User } from 'lucide-react';
import { Profile } from '@/lib/types/database';
import { formatDate } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/users-list')
      .then((r) => r.json())
      .then(({ data }) => { setUsers(data ?? []); setLoading(false); });
  }, []);

  async function toggleRole(user: Profile) {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    if (!confirm(`Change ${user.username ?? 'this user'} to ${newRole}?`)) return;
    setUpdatingId(user.id);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, role: newRole }),
      });
      const { data, error } = await res.json();
      if (error) throw new Error(error);
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, role: newRole } : u));
      toast.success(`Role updated to ${newRole}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update role');
    } finally {
      setUpdatingId(null);
    }
  }

  const filtered = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (u.username ?? '').toLowerCase().includes(q) ||
      (u.display_name ?? '').toLowerCase().includes(q);
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">
          Users <span className="text-gray-500 font-normal text-base">({users.length})</span>
        </h1>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by username..."
          className="w-full pl-9 pr-4 py-2 bg-[#1a1d2e] border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500"
        />
      </div>

      <div className="bg-[#1a1d2e] rounded-xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/10">
                <tr className="text-left">
                  <th className="px-6 py-4 text-gray-500 font-medium">User</th>
                  <th className="px-6 py-4 text-gray-500 font-medium">Username</th>
                  <th className="px-6 py-4 text-gray-500 font-medium">Role</th>
                  <th className="px-6 py-4 text-gray-500 font-medium">Joined</th>
                  <th className="px-6 py-4 text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-600/40 flex items-center justify-center text-sm font-bold text-indigo-300 shrink-0">
                          {(user.display_name ?? user.username ?? 'U')[0].toUpperCase()}
                        </div>
                        <span className="font-medium text-white">{user.display_name ?? user.username ?? 'Anonymous'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">@{user.username}</td>
                    <td className="px-6 py-4">
                      <Badge variant={user.role === 'admin' ? 'purple' : 'default'}>{user.role}</Badge>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{formatDate(user.created_at)}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleRole(user)}
                        disabled={updatingId === user.id}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                          user.role === 'admin'
                            ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                            : 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20'
                        }`}
                      >
                        {user.role === 'admin' ? <><User size={12} /> Demote</> : <><Shield size={12} /> Make Admin</>}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
