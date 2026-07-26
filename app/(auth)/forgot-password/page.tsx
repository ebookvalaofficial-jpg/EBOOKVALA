import React, { Suspense } from 'react';
import { Metadata } from 'next';
import AuthLayout from '@/components/auth/AuthLayout';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Forgot Password — EbookVala',
  description: 'Reset your EbookVala password securely via email verification link.',
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Reset Your Password"
      subtitle="Enter your account email address below and we'll send you a single-use link to reset your password securely."
    >
      <Suspense fallback={
        <div className="w-full py-12 flex justify-center items-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary-blue" />
        </div>
      }>
        <ForgotPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
