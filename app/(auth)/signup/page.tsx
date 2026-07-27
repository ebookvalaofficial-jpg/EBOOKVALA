import React, { Suspense } from 'react';
import { Metadata } from 'next';
import AuthLayout from '@/components/auth/AuthLayout';
import SignupForm from '@/components/auth/SignupForm';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Create an Account — EbookVala',
  description: 'Join EbookVala to unlock thousands of premium tech, coding, business, and self-help eBooks with AI reading tools.',
  robots: { index: false, follow: false },
};

export default function SignupPage() {
  return (
    <AuthLayout>
      <Suspense fallback={
        <div className="w-full py-12 flex justify-center items-center">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      }>
        <SignupForm />
      </Suspense>
    </AuthLayout>
  );
}
