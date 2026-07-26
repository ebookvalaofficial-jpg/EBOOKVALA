'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2, CheckCircle2, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';

interface VerifyEmailContentProps {
  token: string;
}

export default function VerifyEmailContent({ token }: VerifyEmailContentProps) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('Verifying your email address token...');
  const [canResend, setCanResend] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function verifyToken() {
      try {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (!res.ok) {
          setStatus('error');
          setMessage(data.error || 'Verification token is invalid or expired.');
          if (data.canResend) {
            setCanResend(true);
            setUserEmail(data.email);
          }
        } else {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully!');
        }
      } catch (err) {
        console.error('[VERIFY EMAIL ERROR]:', err);
        setStatus('error');
        setMessage('A network error occurred while verifying your email. Please try again.');
      }
    }

    verifyToken();
  }, [token]);

  const handleResend = async () => {
    if (!userEmail) return;
    setIsResending(true);
    setResendSuccess(null);

    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resend', email: userEmail }),
      });

      const data = await res.json();
      if (res.ok) {
        setResendSuccess(data.message || 'New verification email sent successfully!');
      } else {
        setMessage(data.error || 'Failed to resend verification email.');
      }
    } catch (err) {
      console.error('[RESEND VERIFICATION ERROR]:', err);
    } finally {
      setIsResending(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="w-full py-12 flex flex-col items-center justify-center space-y-4 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary-blue" />
        <div>
          <h3 className="text-lg font-bold text-theme-heading font-montserrat">Verifying Email</h3>
          <p className="text-xs text-theme-muted mt-1">Checking security token credentials...</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="w-full space-y-6 text-center animate-in fade-in">
        <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-500 border border-green-500/20 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-xl font-extrabold text-theme-heading font-montserrat">
            Email Verified Successfully!
          </h2>
          <p className="text-xs text-theme-muted mt-2 leading-relaxed">
            {message} You now have full access to EbookVala eBooks and AI reading features.
          </p>
        </div>

        <div className="pt-4 border-t border-theme">
          <Link
            href="/login"
            className="w-full py-3.5 px-4 font-bold text-sm text-white brand-gradient-bg rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-2"
          >
            <span>Proceed to Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 text-center animate-in fade-in">
      <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center mx-auto">
        <AlertCircle className="w-8 h-8" />
      </div>

      <div>
        <h2 className="text-xl font-extrabold text-theme-heading font-montserrat">
          Verification Failed
        </h2>
        <p className="text-xs text-red-500 dark:text-red-400 mt-2 font-medium">
          {message}
        </p>
      </div>

      {resendSuccess && (
        <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 text-xs font-medium">
          {resendSuccess}
        </div>
      )}

      <div className="pt-4 border-t border-theme space-y-3">
        {canResend && (
          <button
            onClick={handleResend}
            disabled={isResending}
            className="w-full py-3 px-4 font-bold text-sm text-white brand-gradient-bg rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isResending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending Email...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Resend Verification Email</span>
              </>
            )}
          </button>
        )}

        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-theme-muted hover:text-theme-heading transition-colors"
        >
          Return to Sign In
        </Link>
      </div>
    </div>
  );
}
