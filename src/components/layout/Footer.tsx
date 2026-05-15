import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-[#2A2A2A] bg-[#0F0F0F]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <Link href="/" className="relative h-11 w-[190px]" aria-label="YoPlayables home">
            <Image
              src="/yoplayables-logo.png"
              alt="YoPlayables"
              fill
              className="object-contain object-left"
              sizes="190px"
            />
          </Link>
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm font-medium text-[#A8A8A8]">
            <a href="#" className="transition-colors hover:text-white">About</a>
            <a href="#" className="transition-colors hover:text-white">Privacy Policy</a>
            <a href="#" className="transition-colors hover:text-white">Terms</a>
            <a href="#" className="transition-colors hover:text-white">Contact</a>
            <a href="#" className="transition-colors hover:text-white">Submit Game</a>
            <Link href="/categories" className="transition-colors hover:text-white">Categories</Link>
          </nav>
          <p className="text-xs text-[#777]">
            Free browser games, built for instant play.
          </p>
        </div>
      </div>
    </footer>
  );
}
