import { Suspense } from 'react';
import LoginForm from '@/components/auth/LoginForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Sign In' };

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0F0F0F] p-4">
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
