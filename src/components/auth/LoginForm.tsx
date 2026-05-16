'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { loginSchema } from '@/lib/validations';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import OAuthButtons from '@/components/auth/OAuthButtons';
import toast from 'react-hot-toast';
import { SITE_NAME } from '@/lib/constants';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const redirectTo = searchParams.get('redirectTo') ?? '/';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      toast.error(result.error.issues[0]?.message ?? result.error.message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      toast.success('Welcome back!');
      router.push(redirectTo);
      router.refresh();
    }
  }
  return (
    <div className="w-full max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Welcome back</h1>
        <p className="mt-1 text-sm text-[#A8A8A8]">Sign in to your{' '}
          <Link href="/" className="font-semibold text-[#9B8CFF]">{SITE_NAME}</Link> account
        </p>
      </div>

      <OAuthButtons redirectTo={redirectTo} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="email" type="email" label="Email" placeholder="you@example.com"
          value={email} onChange={(e) => setEmail(e.target.value)}
          icon={<Mail size={14} />}
        />
        <Input
          id="password" type="password" label="Password" placeholder="••••••••"
          value={password} onChange={(e) => setPassword(e.target.value)}
          icon={<Lock size={14} />}
        />
        <Button type="submit" loading={loading} className="w-full" size="lg">
          Sign in
        </Button>
      </form>

      <p className="text-center text-sm text-[#A8A8A8]">
        No account?{' '}
        <Link href="/register" className="font-semibold text-[#9B8CFF] hover:text-white">Create one</Link>
      </p>
    </div>
  );
}
