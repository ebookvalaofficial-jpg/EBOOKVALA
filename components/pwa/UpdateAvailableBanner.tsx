'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, Sparkles, X } from 'lucide-react';

export default function UpdateAvailableBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleUpdate = () => {
      setShowBanner(true);
    };

    window.addEventListener('pwa-update-available', handleUpdate);
    return () => window.removeEventListener('pwa-update-available', handleUpdate);
  }, []);

  const handleRefresh = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 p-4 rounded-3xl bg-theme-card border border-amber-500/40 glass-card shadow-2xl space-y-3 font-inter text-theme-text animate-slide-up">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 text-amber-500">
          <div className="p-2 rounded-2xl bg-amber-500/10 border border-amber-500/20">
            <Sparkles className="w-5 h-5 fill-amber-500" />
          </div>
          <h4 className="text-sm font-bold text-theme-heading font-montserrat">New Version Available</h4>
        </div>

        <button
          onClick={() => setShowBanner(false)}
          className="p-1 rounded-xl text-theme-muted hover:text-theme-heading hover:bg-theme-surface"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-theme-muted font-semibold leading-relaxed">
        A new update for EbookVala is ready with fresh performance enhancements and improvements.
      </p>

      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          onClick={() => setShowBanner(false)}
          className="px-3.5 py-2 rounded-xl text-xs font-bold text-theme-muted hover:text-theme-heading"
        >
          Later
        </button>

        <button
          onClick={handleRefresh}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white text-xs font-extrabold uppercase shadow-md transition-all flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh to Update</span>
        </button>
      </div>
    </div>
  );
}
