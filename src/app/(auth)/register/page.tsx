import RegisterForm from '@/components/auth/RegisterForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Create Account' };

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0F0F0F] p-4">
      <RegisterForm />
    </main>
  );
}
