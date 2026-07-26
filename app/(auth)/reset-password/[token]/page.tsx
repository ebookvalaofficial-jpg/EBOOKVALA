import React, { Suspense } from 'react';
import { Metadata } from 'next';
import AuthLayout from '@/components/auth/AuthLayout';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Set New Password — EbookVala',
  description: 'Choose a strong new password for your EbookVala account.',
  robots: { index: false, follow: false },
};

interface ResetPasswordParams {
  params: Promise<{ token: string }>;
}

export default async function ResetPasswordPage({ params }: ResetPasswordParams) {
  const { token } = await params;

  return (
    <AuthLayout
      title="Set a New Password"
      subtitle="Ensure your account stays secure by choosing a strong password with letters, numbers, and special characters."
    >
      <Suspense fallback={
        <div className="w-full py-12 flex justify-center items-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary-blue" />
        </div>
      }>
        <ResetPasswordForm token={token} />
      </Suspense>
    </AuthLayout>
  );
}
