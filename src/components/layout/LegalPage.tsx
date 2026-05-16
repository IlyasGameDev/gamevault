import Link from 'next/link';

export default function LegalPage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      <section className="rounded-[28px] border border-[#252525] bg-[#161616] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:p-8">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-[#9B8CFF]">{eyebrow}</p>
        <h1 className="mt-4 text-3xl font-black text-white sm:text-4xl">{title}</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[#D8D8D8] sm:text-lg">{intro}</p>
      </section>

      <div className="mt-8 space-y-6 rounded-[28px] border border-[#252525] bg-[#121212] p-6 text-sm leading-7 text-[#C9C9C9] sm:p-8 sm:text-base">
        {children}
      </div>

      <div className="mt-6 text-sm text-[#8D8D8D]">
        <Link href="/" className="transition-colors hover:text-white">Back to home</Link>
      </div>
    </main>
  );
}
