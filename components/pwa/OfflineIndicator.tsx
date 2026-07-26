'use client';

import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export default function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);
  const [showRestored, setShowRestored] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOffline = () => {
      setIsOffline(true);
      setShowRestored(false);
    };

    const handleOnline = () => {
      setIsOffline(false);
      setShowRestored(true);
      const timer = setTimeout(() => setShowRestored(false), 3500);
      return () => clearTimeout(timer);
    };

    setIsOffline(!navigator.onLine);

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (!isOffline && !showRestored) return null;

  return (
    <div className="fixed top-0 inset-x-0 z-50 pointer-events-none font-inter text-xs">
      {isOffline && (
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 text-white px-4 py-2 text-center font-bold shadow-lg flex items-center justify-center gap-2 animate-bounce-short pointer-events-auto">
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>You are currently offline. Visited books and cached pages remain available.</span>
        </div>
      )}

      {showRestored && (
        <div className="bg-emerald-600 text-white px-4 py-2 text-center font-bold shadow-lg flex items-center justify-center gap-2 pointer-events-auto animate-fade-in">
          <Wifi className="w-4 h-4 shrink-0" />
          <span>Internet connection restored!</span>
        </div>
      )}
    </div>
  );
}
