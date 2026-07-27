'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Mail, Lock, User, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, ShieldCheck, BookOpen, Feather, Check } from 'lucide-react';
import { signupSchema, SignupInput } from '@/lib/validations/auth';

export default function SignupForm() {
  const searchParams = useSearchParams();
  const refCode = searchParams?.get('ref') || searchParams?.get('referralCode') || '';

  const [formData, setFormData] = useState<SignupInput>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: false,
  });

  const [intendedRole, setIntendedRole] = useState<'reader' | 'author'>('reader');
  const [errors, setErrors] = useState<{ [key in keyof SignupInput]?: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [registeredSuccess, setRegisteredSuccess] = useState<{
    email: string;
    message: string;
    demoVerificationUrl?: string;
    redirectTo?: string;
  } | null>(null);

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

  const validateField = (field: keyof SignupInput, value: unknown) => {
    const updated = { ...formData, [field]: value };
    const result = signupSchema.safeParse(updated);

    if (!result.success) {
      const fieldError = result.error.issues.find((issue) => issue.path[0] === field);
      setErrors((prev) => ({ ...prev, [field]: fieldError ? fieldError.message : undefined }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
    setServerError(null);
    validateField(name as keyof SignupInput, val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const validation = signupSchema.safeParse(formData);
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
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          intendedRole,
          referralCode: refCode || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error || 'Failed to create account.');
        setIsLoading(false);
      } else {
        setRegisteredSuccess({
          email: data.email,
          message: data.message,
          demoVerificationUrl: data.demoVerificationUrl,
          redirectTo: data.redirectTo,
        });
        setIsLoading(false);
      }
    } catch (err: unknown) {
      console.error('[SIGNUP SUBMIT ERROR]:', err);
      setServerError('An unexpected network error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  if (registeredSuccess) {
    return (
      <div className="w-full space-y-6 text-center animate-in fade-in">
        <div className="w-16 h-16 rounded-full bg-blue-500/10 text-primary-blue border border-blue-500/20 flex items-center justify-center mx-auto">
          <Mail className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-xl font-extrabold text-theme-heading font-montserrat">
            Check Your Email
          </h2>
          <p className="text-xs text-theme-muted mt-2 leading-relaxed">
            We sent a verification link to{' '}
            <strong className="text-theme-heading">{registeredSuccess.email}</strong>.
            Please verify your email address to activate your account!
          </p>
        </div>

        {/* Local Dev Demo Direct Link Box */}
        {registeredSuccess.demoVerificationUrl && (
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-theme text-left space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary-blue flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Local Dev Simulation Shortcut
            </span>
            <p className="text-xs text-theme-muted">
              Click the token link below to simulate email verification and proceed:
            </p>
            <a
              href={registeredSuccess.demoVerificationUrl}
              className="inline-block text-xs font-semibold text-primary-blue hover:underline break-all"
            >
              {registeredSuccess.demoVerificationUrl}
            </a>
          </div>
        )}

        <div className="pt-4 border-t border-theme flex flex-col gap-3">
          <Link
            href={registeredSuccess.redirectTo || '/login'}
            className="w-full py-3 px-4 font-bold text-sm text-white brand-gradient-bg rounded-xl shadow-lg shadow-blue-500/25 transition-all text-center block"
          >
            {intendedRole === 'author' ? 'Continue to Author Application' : 'Go to Sign In'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-5">
      {/* Referral Code Banner */}
      {refCode && (
        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-primary-blue text-xs font-semibold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>Signing up with referral code <strong className="uppercase">{refCode}</strong> (+50 XP Bonus!)</span>
        </div>
      )}

      {/* Server Error Banner */}
      {serverError && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs sm:text-sm font-medium flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
        {/* Full Name Field */}
        <div>
          <label className="block text-xs font-bold text-theme-heading mb-1 uppercase tracking-wider">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-theme-muted">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Prince Gajera"
              className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border text-theme-heading text-sm rounded-xl focus:outline-none focus:ring-2 transition-all ${
                errors.name ? 'border-red-500 focus:ring-red-500' : 'border-theme focus:ring-blue-500'
              }`}
            />
          </div>
          {errors.name && <p className="text-xs text-red-500 mt-1 font-medium">{errors.name}</p>}
        </div>

        {/* Email Field */}
        <div>
          <label className="block text-xs font-bold text-theme-heading mb-1 uppercase tracking-wider">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-theme-muted">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border text-theme-heading text-sm rounded-xl focus:outline-none focus:ring-2 transition-all ${
                errors.email ? 'border-red-500 focus:ring-red-500' : 'border-theme focus:ring-blue-500'
              }`}
            />
          </div>
          {errors.email && <p className="text-xs text-red-500 mt-1 font-medium">{errors.email}</p>}
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-xs font-bold text-theme-heading mb-1 uppercase tracking-wider">
            Password
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
              placeholder="Min 8 chars, 1 upper, 1 number"
              className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/80 border text-theme-heading text-sm rounded-xl focus:outline-none focus:ring-2 transition-all ${
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

          {/* Password Strength Indicator Meter */}
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

        {/* Confirm Password Field */}
        <div>
          <label className="block text-xs font-bold text-theme-heading mb-1 uppercase tracking-wider">
            Confirm Password
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
              placeholder="Re-enter password"
              className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border text-theme-heading text-sm rounded-xl focus:outline-none focus:ring-2 transition-all ${
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

        {/* Inline "I WANT TO..." Selector Cards */}
        <div className="pt-2">
          <label className="block text-xs font-bold text-theme-heading mb-2 uppercase tracking-wider">
            I Want To...
          </label>
          <div className="grid grid-cols-2 gap-3">
            {/* Read Books Option */}
            <div
              onClick={() => setIntendedRole('reader')}
              className={`relative p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                intendedRole === 'reader'
                  ? 'bg-blue-500/15 border-blue-500 text-white shadow-md shadow-blue-500/10'
                  : 'bg-slate-800/40 border-slate-700/80 text-slate-400 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-xl ${intendedRole === 'reader' ? 'bg-blue-600 text-white' : 'bg-slate-700/60 text-slate-300'}`}>
                  <BookOpen className="w-4 h-4" />
                </div>
                {intendedRole === 'reader' && (
                  <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}
              </div>
              <div>
                <span className="text-xs font-bold block text-white">Read Books</span>
                <span className="text-[10px] text-slate-400 leading-tight block mt-0.5">
                  Discover, read & collect eBooks
                </span>
              </div>
            </div>

            {/* Publish Books Option */}
            <div
              onClick={() => setIntendedRole('author')}
              className={`relative p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                intendedRole === 'author'
                  ? 'bg-purple-500/15 border-purple-500 text-white shadow-md shadow-purple-500/10'
                  : 'bg-slate-800/40 border-slate-700/80 text-slate-400 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-xl ${intendedRole === 'author' ? 'bg-purple-600 text-white' : 'bg-slate-700/60 text-slate-300'}`}>
                  <Feather className="w-4 h-4" />
                </div>
                {intendedRole === 'author' && (
                  <span className="w-4 h-4 rounded-full bg-purple-500 text-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}
              </div>
              <div>
                <span className="text-xs font-bold block text-white">Publish Books</span>
                <span className="text-[10px] text-slate-400 leading-tight block mt-0.5">
                  Publish eBooks & earn royalties
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Terms & Conditions Checkbox */}
        <div className="flex items-start">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            checked={formData.terms}
            onChange={handleChange}
            className="mt-0.5 w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="terms" className="ml-2 text-xs text-theme-body leading-tight cursor-pointer">
            I agree to EbookVala&apos;s{' '}
            <a href="#" className="text-primary-blue font-semibold hover:underline">Terms of Service</a>{' '}
            & <a href="#" className="text-primary-blue font-semibold hover:underline">Privacy Policy</a>.
          </label>
        </div>
        {errors.terms && <p className="text-xs text-red-500 font-medium">{errors.terms}</p>}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-4 font-bold text-sm text-white brand-gradient-bg rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating Account...</span>
            </>
          ) : (
            <span>{intendedRole === 'author' ? 'Create Account & Apply as Author' : 'Create Account'}</span>
          )}
        </button>
      </form>

      {/* Redirect to Login */}
      <p className="text-center text-xs text-theme-muted pt-1 font-medium">
        Already have an account?{' '}
        <Link href="/login" className="text-primary-blue font-bold hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
}
