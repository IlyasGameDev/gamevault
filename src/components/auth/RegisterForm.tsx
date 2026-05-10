'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { registerSchema } from '@/lib/validations';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function RegisterForm() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = registerSchema.safeParse({ username, email, password });
    if (!result.success) {
      toast.error(result.error.issues[0]?.message ?? result.error.message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username, display_name: username } },
    });
    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      toast.success('Account created! Check your email to confirm.');
      router.push('/login');
    }
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Create account</h1>
        <p className="text-gray-500 mt-1 text-sm">Join GameVault and start playing</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="username" label="Username" placeholder="coolplayer123"
          value={username} onChange={(e) => setUsername(e.target.value)}
          icon={<User size={14} />}
        />
        <Input
          id="email" type="email" label="Email" placeholder="you@example.com"
          value={email} onChange={(e) => setEmail(e.target.value)}
          icon={<Mail size={14} />}
        />
        <Input
          id="password" type="password" label="Password" placeholder="Min. 8 characters"
          value={password} onChange={(e) => setPassword(e.target.value)}
          icon={<Lock size={14} />}
        />
        <Button type="submit" loading={loading} className="w-full" size="lg">
          Create account
        </Button>
      </form>
      <p className="text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link href="/login" className="text-indigo-400 hover:text-indigo-300">Sign in</Link>
      </p>
    </div>
  );
}
