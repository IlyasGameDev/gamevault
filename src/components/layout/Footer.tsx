import Link from 'next/link';
import { Gamepad2 } from 'lucide-react';
import { SITE_NAME } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0f1117] mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-white font-bold text-lg">
            <Gamepad2 className="text-indigo-500" size={22} />
            {SITE_NAME}
          </div>
          <nav className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="/games" className="hover:text-white transition-colors">Browse Games</Link>
            <Link href="/categories" className="hover:text-white transition-colors">Categories</Link>
            <a href="#" className="hover:text-white transition-colors">About</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </nav>
          <p className="text-xs text-gray-600">
            Built with ❤️ by {SITE_NAME} — Free browser games
          </p>
        </div>
      </div>
    </footer>
  );
}
