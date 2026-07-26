'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function GlobalAppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled App Error caught by error boundary:', error);
  }, [error]);

  return (
    <main className="min-h-screen bg-theme-bg flex items-center justify-center p-4 font-inter text-theme-text">
      <div className="max-w-md w-full p-8 rounded-3xl bg-theme-card border border-theme glass-card text-center space-y-5 shadow-2xl">
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 w-max mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <h1 className="text-xl font-bold text-theme-heading font-montserrat">Something Went Wrong</h1>
          <p className="text-xs text-theme-muted leading-relaxed">
            An unexpected application error occurred. Don&apos;t worry, your reading data and progress are safe.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-white text-xs font-bold uppercase tracking-wide shadow-lg transition-all flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            className="px-5 py-2.5 rounded-2xl bg-theme-surface border border-theme/60 text-theme-heading text-xs font-bold uppercase tracking-wide hover:bg-slate-500/10 transition-all flex items-center gap-1.5"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return Home</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
