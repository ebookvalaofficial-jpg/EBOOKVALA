'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { WifiOff, RefreshCw, BookOpen, Home } from 'lucide-react';

export default function OfflinePage() {
  const [isRetrying, setIsRetrying] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    setIsRetrying(true);
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }, 800);
  };

  return (
    <main className="min-h-screen bg-theme-bg flex items-center justify-center p-4 font-inter text-theme-text">
      <div className="max-w-md w-full p-8 rounded-3xl bg-theme-card border border-theme glass-card text-center space-y-6 shadow-2xl relative overflow-hidden">
        {/* Amber Glow Accent */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-500 w-max mx-auto shadow-inner">
          <WifiOff className="w-10 h-10 animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase font-montserrat">
            {isOnline ? 'Connection Restored' : 'You Are Offline'}
          </span>

          <h1 className="text-2xl font-black text-theme-heading font-montserrat tracking-tight">
            Offline Mode Active
          </h1>

          <p className="text-xs text-theme-muted font-semibold leading-relaxed max-w-sm mx-auto">
            You are currently disconnected from the internet. Previously visited books and cached chapters remain accessible for reading.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white text-xs font-extrabold uppercase tracking-wide shadow-xl disabled:opacity-40 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
            <span>{isRetrying ? 'Retrying...' : 'Retry Connection'}</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-theme-surface border border-theme/60 text-theme-heading text-xs font-bold uppercase tracking-wide hover:bg-slate-500/10 transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4 text-amber-500" />
            <span>Go to Home</span>
          </Link>
        </div>

        <div className="pt-4 border-t border-theme/40 text-[11px] text-theme-muted font-medium flex items-center justify-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-amber-500" />
          <span>EbookVala Offline Reader Shell</span>
        </div>
      </div>
    </main>
  );
}
