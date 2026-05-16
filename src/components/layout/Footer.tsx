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
            <Link href="/about" className="transition-colors hover:text-white">About</Link>
            <Link href="/privacy-policy" className="transition-colors hover:text-white">Privacy Policy</Link>
            <Link href="/terms-of-service" className="transition-colors hover:text-white">Terms of Service</Link>
          </nav>
          <p className="text-xs text-[#777]">
            Free browser games, built for instant play.
          </p>
        </div>
      </div>
    </footer>
  );
}
