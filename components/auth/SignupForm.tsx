'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Mail, Lock, User, Eye, EyeOff, Loader2, AlertCircle, ShieldCheck, BookOpen, Feather, ArrowRight } from 'lucide-react';
import { signupSchema, SignupInput } from '@/lib/validations/auth';

export default function SignupForm() {
  const searchParams = useSearchParams();
  const refCode = searchParams?.get('ref') || searchParams?.get('referralCode') || '';

  const [formData, setFormData] = useState<SignupInput>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: true,
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
        <div className="w-16 h-16 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mx-auto">
          <Mail className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-xl font-extrabold text-white font-montserrat">
            Check Your Email
          </h2>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            We sent a verification link to{' '}
            <strong className="text-white">{registeredSuccess.email}</strong>.
            Please verify your email address to activate your account!
          </p>
        </div>

        {registeredSuccess.demoVerificationUrl && (
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-left space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1 font-mono">
              <ShieldCheck className="w-3.5 h-3.5" /> Local Dev Simulation Shortcut
            </span>
            <p className="text-xs text-slate-400">
              Click the token link below to simulate email verification and proceed:
            </p>
            <a
              href={registeredSuccess.demoVerificationUrl}
              className="inline-block text-xs font-semibold text-blue-400 hover:underline break-all"
            >
              {registeredSuccess.demoVerificationUrl}
            </a>
          </div>
        )}

        <div className="pt-4 border-t border-slate-800 flex flex-col gap-3">
          <Link
            href={registeredSuccess.redirectTo || '/login'}
            className="w-full py-3.5 px-4 font-bold text-sm text-white bg-[#2563eb] hover:bg-blue-500 rounded-full shadow-lg shadow-blue-600/30 transition-all text-center block"
          >
            {intendedRole === 'author' ? 'Continue to Author Application' : 'Go to Sign In'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight font-montserrat">
          Create account
        </h2>
        <p className="text-sm text-slate-400 mt-1 font-inter">
          Join EBOOKVALA to read and publish free digital books.
        </p>
      </div>

      {refCode && (
        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>Signing up with referral code <strong className="uppercase">{refCode}</strong> (+50 XP Bonus!)</span>
        </div>
      )}

      {serverError && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs sm:text-sm font-medium flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Full Name */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-widest font-mono">
            FULL NAME
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Prince Gajera"
              className={`w-full pl-10 pr-4 py-2.5 bg-[#0f172a] border text-white text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-500 ${
                errors.name ? 'border-red-500' : 'border-slate-800'
              }`}
            />
          </div>
          {errors.name && <p className="text-xs text-red-400 mt-1 font-medium">{errors.name}</p>}
        </div>

        {/* Email Address */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-widest font-mono">
            EMAIL ADDRESS
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              className={`w-full pl-10 pr-4 py-2.5 bg-[#0f172a] border text-white text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-500 ${
                errors.email ? 'border-red-500' : 'border-slate-800'
              }`}
            />
          </div>
          {errors.email && <p className="text-xs text-red-400 mt-1 font-medium">{errors.email}</p>}
        </div>

        {/* 2-Column Password Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-widest font-mono">
              PASSWORD
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full pl-10 pr-10 py-2.5 bg-[#0f172a] border text-white text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-500 ${
                  errors.password ? 'border-red-500' : 'border-slate-800'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            {errors.password && <p className="text-[11px] text-red-400 mt-1 font-medium">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-widest font-mono">
              CONFIRM PASSWORD
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full pl-10 pr-4 py-2.5 bg-[#0f172a] border text-white text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-500 ${
                  errors.confirmPassword ? 'border-red-500' : 'border-slate-800'
                }`}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-[11px] text-red-400 mt-1 font-medium">{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        {/* Role Selector: I WANT TO... */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-widest font-mono">
            I WANT TO...
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setIntendedRole('reader')}
              className={`p-3.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                intendedRole === 'reader'
                  ? 'bg-blue-600/10 border-blue-500 text-white shadow-md shadow-blue-500/10'
                  : 'bg-[#0f172a] border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <BookOpen className={`w-4 h-4 ${intendedRole === 'reader' ? 'text-blue-400' : 'text-slate-400'}`} />
              <span className="text-xs font-bold block">Read Books</span>
            </button>

            <button
              type="button"
              onClick={() => setIntendedRole('author')}
              className={`p-3.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                intendedRole === 'author'
                  ? 'bg-blue-600/10 border-blue-500 text-white shadow-md shadow-blue-500/10'
                  : 'bg-[#0f172a] border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Feather className={`w-4 h-4 ${intendedRole === 'author' ? 'text-blue-400' : 'text-slate-400'}`} />
              <span className="text-xs font-bold block">Publish Books</span>
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-6 font-bold text-sm text-white bg-[#2563eb] hover:bg-blue-500 rounded-full shadow-lg shadow-blue-600/30 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-4"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Redirect Link */}
      <p className="text-center text-xs text-slate-400 pt-1 font-medium">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-400 font-bold hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
}
