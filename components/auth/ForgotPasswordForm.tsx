'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Loader2, AlertCircle, CheckCircle2, ArrowLeft, KeyRound } from 'lucide-react';
import { forgotPasswordSchema, ForgotPasswordInput } from '@/lib/validations/auth';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successResult, setSuccessResult] = useState<{
    message: string;
    demoResetUrl?: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = forgotPasswordSchema.safeParse({ email });
    if (!validation.success) {
      setError(validation.error.issues[0]?.message || 'Please enter a valid email address.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to request password reset.');
        setIsLoading(false);
      } else {
        setSuccessResult({
          message: data.message,
          demoResetUrl: data.demoResetUrl,
        });
        setIsLoading(false);
      }
    } catch (err: unknown) {
      console.error('[FORGOT PASSWORD SUBMIT ERROR]:', err);
      setError('An unexpected network error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  if (successResult) {
    return (
      <div className="w-full space-y-6 text-center animate-in fade-in">
        <div className="w-16 h-16 rounded-full bg-blue-500/10 text-primary-blue border border-blue-500/20 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-xl font-extrabold text-theme-heading font-montserrat">
            Check Your Inbox
          </h2>
          <p className="text-xs text-theme-muted mt-2 leading-relaxed">
            {successResult.message}
          </p>
        </div>

        {/* Local Dev Demo Direct Link Box */}
        {successResult.demoResetUrl && (
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-theme text-left space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary-blue flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5" /> Dev Reset Link Shortcut
            </span>
            <p className="text-xs text-theme-muted">
              Click the generated token link below to test resetting password:
            </p>
            <a
              href={successResult.demoResetUrl}
              className="inline-block text-xs font-semibold text-primary-blue hover:underline break-all"
            >
              {successResult.demoResetUrl}
            </a>
          </div>
        )}

        <div className="pt-4 border-t border-theme">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-xs font-bold text-primary-blue hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-5">
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs sm:text-sm font-medium flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label className="block text-xs font-bold text-theme-heading mb-1.5 uppercase tracking-wider">
            Registered Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-theme-muted">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              placeholder="you@example.com"
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-theme text-theme-heading text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-4 font-bold text-sm text-white brand-gradient-bg rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Sending Link...</span>
            </>
          ) : (
            <span>Send Reset Password Link</span>
          )}
        </button>
      </form>

      <div className="pt-2 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-theme-muted hover:text-theme-heading transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
        </Link>
      </div>
    </div>
  );
}
