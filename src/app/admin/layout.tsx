'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Gamepad2, LayoutDashboard, Tags, MessageSquare, Users, ExternalLink, Menu, X, Shield, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { SITE_NAME } from '@/lib/constants';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/games', label: 'Games', icon: Gamepad2 },
  { href: '/admin/categories', label: 'Categories', icon: Tags },
  { href: '/admin/comments', label: 'Comments', icon: MessageSquare },
  { href: '/admin/users', label: 'Users', icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    toast.success('Signed out');
    router.push('/');
  }

  const NavLinks = () => (
    <nav className="flex-1 p-4 space-y-1">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setSidebarOpen(false)}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              active ? 'bg-indigo-600/20 text-indigo-400' : 'text-gray-400 hover:text-white hover:bg-white/5'
            )}
          >
            <Icon size={18} />
            {label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-[#0f1117]">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 h-screen sticky top-0 border-r border-white/10 bg-[#0d0f1a] flex-col">
        <div className="p-6 border-b border-white/10">
          <Link href="/admin" className="flex items-center gap-2 font-bold text-white">
            <Gamepad2 className="text-indigo-500" size={20} />
            {SITE_NAME} Admin
          </Link>
        </div>
        <NavLinks />
        <div className="p-4 border-t border-white/10 space-y-2">
          <Link href="/" target="_blank" className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition-colors">
            <ExternalLink size={12} /> View site
          </Link>
          <button onClick={handleSignOut} className="flex items-center gap-2 text-xs text-gray-500 hover:text-red-400 transition-colors">
            <LogOut size={12} /> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-[#0d0f1a] border-r border-white/10 flex flex-col z-50">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-2">
                <Gamepad2 className="text-indigo-500" size={20} /> Admin
              </span>
              <button onClick={() => setSidebarOpen(false)} className="text-gray-500 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <NavLinks />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-auto">
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0f1117]/95 backdrop-blur-sm px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden text-gray-400 hover:text-white"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <span className="text-sm text-gray-500 hidden sm:block">
              {NAV.find((n) => n.href === '/admin' ? pathname === '/admin' : pathname.startsWith(n.href))?.label ?? 'Admin'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-7 h-7 rounded-full bg-indigo-600/40 flex items-center justify-center text-xs font-bold text-indigo-300">
                {(profile?.display_name ?? profile?.username ?? 'A')[0].toUpperCase()}
              </div>
              <span className="text-gray-300 hidden sm:block">{profile?.display_name ?? profile?.username}</span>
              <Shield size={14} className="text-indigo-400" />
            </div>
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
