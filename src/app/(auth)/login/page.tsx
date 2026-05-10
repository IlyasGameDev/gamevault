import { Suspense } from 'react';
import LoginForm from '@/components/auth/LoginForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Sign In — GameVault' };

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#0f1117] flex items-center justify-center p-4">
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
