import { supabaseAdmin } from '@/lib/supabase/admin';
import { Profile } from '@/lib/types/database';
import { formatDate } from '@/lib/utils';
import Badge from '@/components/ui/Badge';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Users — Admin' };

async function getUsers(): Promise<Profile[]> {
  const { data } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  return data ?? [];
}

export default async function AdminUsersPage() {
  const users = await getUsers();

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold text-white">Users <span className="text-gray-500 font-normal text-base">({users.length})</span></h1>

      <div className="bg-[#1a1d2e] rounded-xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10">
              <tr className="text-left">
                <th className="px-6 py-4 text-gray-500 font-medium">User</th>
                <th className="px-6 py-4 text-gray-500 font-medium">Username</th>
                <th className="px-6 py-4 text-gray-500 font-medium">Role</th>
                <th className="px-6 py-4 text-gray-500 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-600/40 flex items-center justify-center text-sm font-bold text-indigo-300">
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
