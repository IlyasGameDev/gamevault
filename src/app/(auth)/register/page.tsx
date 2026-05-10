import RegisterForm from '@/components/auth/RegisterForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Create Account — GameVault' };

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-[#0f1117] flex items-center justify-center p-4">
      <RegisterForm />
    </main>
  );
}
