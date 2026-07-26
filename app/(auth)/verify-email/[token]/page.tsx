import React, { Suspense } from 'react';
import { Metadata } from 'next';
import AuthLayout from '@/components/auth/AuthLayout';
import VerifyEmailContent from '@/components/auth/VerifyEmailContent';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Verify Email Address — EbookVala',
  description: 'Confirming your email address for your EbookVala account.',
  robots: { index: false, follow: false },
};

interface VerifyEmailParams {
  params: Promise<{ token: string }>;
}

export default async function VerifyEmailPage({ params }: VerifyEmailParams) {
  const { token } = await params;

  return (
    <AuthLayout
      title="Account Email Verification"
      subtitle="We are confirming your email address to ensure account security and activate your subscription benefits."
    >
      <Suspense fallback={
        <div className="w-full py-12 flex justify-center items-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary-blue" />
        </div>
      }>
        <VerifyEmailContent token={token} />
      </Suspense>
    </AuthLayout>
  );
}
