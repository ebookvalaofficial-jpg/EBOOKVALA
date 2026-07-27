'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { loginSchema, LoginInput } from '@/lib/validations/auth';

export default function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [formData, setFormData] = useState<LoginInput>({
    email: '',
    password: '',
    rememberMe: true,
  });

  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = useState<string | null>(null);

  const validateField = (field: keyof LoginInput, value: unknown) => {
    const updated = { ...formData, [field]: value };
    const result = loginSchema.safeParse(updated);

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
    validateField(name as keyof LoginInput, val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setServerSuccess(null);

    const validation = loginSchema.safeParse(formData);
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
      const res = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
        callbackUrl,
      });

      if (res?.error) {
        if (res.error === 'CredentialsSignin' || res.error === 'Configuration') {
          setServerError('Invalid email or password. Please double-check your credentials and try again.');
        } else {
          setServerError(res.error);
        }
        setIsLoading(false);
      } else {
        setServerSuccess('Signed in successfully! Redirecting...');
        window.location.href = callbackUrl || '/dashboard';
      }
    } catch (err: unknown) {
      console.error('[LOGIN SUBMIT ERROR]:', err);
      setServerError('An unexpected network error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight font-montserrat">
          Sign in
        </h2>
        <p className="text-sm text-slate-400 mt-1 font-inter">
          Enter credentials to access EBOOKVALA.
        </p>
      </div>

      {/* Feedback Banners */}
      {serverError && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs sm:text-sm font-medium flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      {serverSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-medium flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{serverSuccess}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Email */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-widest font-mono">
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
              className={`w-full pl-10 pr-4 py-3 bg-[#0f172a] border text-white text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-500 ${
                errors.email ? 'border-red-500' : 'border-slate-800'
              }`}
            />
          </div>
          {errors.email && <p className="text-xs text-red-400 mt-1.5 font-medium">{errors.email}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-widest font-mono">
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
              className={`w-full pl-10 pr-10 py-3 bg-[#0f172a] border text-white text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-500 ${
                errors.password ? 'border-red-500' : 'border-slate-800'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-400 mt-1.5 font-medium">{errors.password}</p>}

          <div className="flex justify-end mt-2">
            <Link href="/forgot-password" className="text-xs font-semibold text-blue-400 hover:underline">
              Forgot Password?
            </Link>
          </div>
        </div>

        {/* Remember me */}
        <div className="flex items-center">
          <input
            id="rememberMe"
            name="rememberMe"
            type="checkbox"
            checked={formData.rememberMe}
            onChange={handleChange}
            className="w-4 h-4 text-blue-600 bg-slate-900 border-slate-700 rounded focus:ring-blue-500"
          />
          <label htmlFor="rememberMe" className="ml-2 text-xs font-medium text-slate-300 cursor-pointer">
            Remember me for 30 days
          </label>
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
              <span>Signing In...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Footer link */}
      <p className="text-center text-xs text-slate-400 pt-2 font-medium">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-blue-400 font-bold hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}
