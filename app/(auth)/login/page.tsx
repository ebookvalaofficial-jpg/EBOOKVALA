import React, { Suspense } from 'react';
import { Metadata } from 'next';
import AuthLayout from '@/components/auth/AuthLayout';
import LoginForm from '@/components/auth/LoginForm';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Sign In — EbookVala',
  description: 'Log in to your EbookVala account to access your digital library, AI Chat with Book, and reading progress.',
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome Back to EbookVala"
      subtitle="Sign in to access your purchased eBooks, AI Chat Assistant, and synced reading highlights across all your devices."
    >
      <Suspense fallback={
        <div className="w-full py-12 flex justify-center items-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary-blue" />
        </div>
      }>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
