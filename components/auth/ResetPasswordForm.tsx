'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { resetPasswordSchema, ResetPasswordInput } from '@/lib/validations/auth';

interface ResetPasswordFormProps {
  token: string;
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState<ResetPasswordInput>({
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isValidatingToken, setIsValidatingToken] = useState(true);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Validate reset token on mount
  useEffect(() => {
    async function validateToken() {
      try {
        const res = await fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`);
        const data = await res.json();
        if (!data.valid) {
          setTokenError(data.error || 'Password reset link is invalid or expired.');
        }
      } catch (err) {
        console.error('[TOKEN VERIFY ERROR]:', err);
        setTokenError('Failed to verify token validity. Please try requesting a new link.');
      } finally {
        setIsValidatingToken(false);
      }
    }
    validateToken();
  }, [token]);

  // Live Password Strength Calculation
  const calculatePasswordStrength = (pass: string) => {
    let score = 0;
    if (!pass) return { score: 0, label: 'Too short', color: 'bg-slate-300' };
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 25, label: 'Weak', color: 'bg-red-500' };
    if (score === 2 || score === 3) return { score: 65, label: 'Medium', color: 'bg-amber-500' };
    return { score: 100, label: 'Strong', color: 'bg-green-500' };
  };

  const strength = calculatePasswordStrength(formData.password);

  const validateField = (field: keyof ResetPasswordInput, value: string) => {
    const updated = { ...formData, [field]: value };
    const result = resetPasswordSchema.safeParse(updated);

    if (!result.success) {
      const fieldError = result.error.issues.find((issue) => issue.path[0] === field);
      setErrors((prev) => ({ ...prev, [field]: fieldError ? fieldError.message : undefined }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setServerError(null);
    validateField(name as keyof ResetPasswordInput, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const validation = resetPasswordSchema.safeParse(formData);
    if (!validation.success) {
      const formattedErrors: { [key: string]: string } = {};
      validation.error.issues.forEach((issue) => {
        if (issue.path[0]) formattedErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(formattedErrors);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error || 'Failed to reset password.');
        setIsLoading(false);
      } else {
        setSuccessMessage(data.message || 'Password reset successfully!');
        setIsLoading(false);
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      }
    } catch (err: unknown) {
      console.error('[RESET PASSWORD SUBMIT ERROR]:', err);
      setServerError('An unexpected network error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  if (isValidatingToken) {
    return (
      <div className="w-full py-12 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary-blue" />
        <span className="text-xs text-theme-muted font-medium">Verifying reset token...</span>
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className="w-full space-y-6 text-center animate-in fade-in">
        <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-xl font-extrabold text-theme-heading font-montserrat">
            Invalid Reset Link
          </h2>
          <p className="text-xs text-theme-muted mt-2 leading-relaxed">
            {tokenError}
          </p>
        </div>

        <div className="pt-4 border-t border-theme space-y-3">
          <Link
            href="/forgot-password"
            className="w-full py-3 px-4 font-bold text-sm text-white brand-gradient-bg rounded-xl shadow-lg shadow-blue-500/25 transition-all text-center block"
          >
            Request New Reset Link
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-theme-muted hover:text-theme-heading transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-5">
      {serverError && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs sm:text-sm font-medium flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 text-xs sm:text-sm font-medium flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* New Password Field */}
        <div>
          <label className="block text-xs font-bold text-theme-heading mb-1.5 uppercase tracking-wider">
            New Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-theme-muted">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min 8 chars, 1 uppercase, 1 number"
              className={`w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-800/80 border text-theme-heading text-sm rounded-xl focus:outline-none focus:ring-2 transition-all ${
                errors.password ? 'border-red-500 focus:ring-red-500' : 'border-theme focus:ring-blue-500'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-theme-muted hover:text-theme-heading"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Password Strength Meter */}
          {formData.password.length > 0 && (
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-theme-muted">
                <span>Strength: <span className="text-theme-heading">{strength.label}</span></span>
                <span>{strength.score}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${strength.color}`}
                  style={{ width: `${strength.score}%` }}
                />
              </div>
            </div>
          )}

          {errors.password && <p className="text-xs text-red-500 mt-1 font-medium">{errors.password}</p>}
        </div>

        {/* Confirm New Password Field */}
        <div>
          <label className="block text-xs font-bold text-theme-heading mb-1.5 uppercase tracking-wider">
            Confirm New Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-theme-muted">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter new password"
              className={`w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border text-theme-heading text-sm rounded-xl focus:outline-none focus:ring-2 transition-all ${
                errors.confirmPassword
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-theme focus:ring-blue-500'
              }`}
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-500 mt-1 font-medium">{errors.confirmPassword}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-4 font-bold text-sm text-white brand-gradient-bg rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Updating Password...</span>
            </>
          ) : (
            <span>Reset Password & Sign In</span>
          )}
        </button>
      </form>
    </div>
  );
}
