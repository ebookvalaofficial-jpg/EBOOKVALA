'use client';

import React, { useState, useEffect } from 'react';
import { Download, Share, PlusSquare, X, Smartphone, Sparkles } from 'lucide-react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check session suppression
    const isDismissed = sessionStorage.getItem('pwa-prompt-dismissed');
    if (isDismissed) return;

    // Check iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    if (isIosDevice && !isStandalone) {
      setIsIOS(true);
    }

    // Listen for BeforeInstallPromptEvent (Android & Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Delay showing prompt until user engages slightly
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIOSModal(false);
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  return (
    <>
      {/* Custom A2HS Install Banner (Desktop / Android) */}
      {showPrompt && deferredPrompt && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 p-5 rounded-3xl bg-theme-card border border-amber-500/40 glass-card shadow-2xl space-y-4 font-inter text-theme-text animate-slide-up">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 shrink-0">
                <Smartphone className="w-6 h-6" />
              </div>

              <div>
                <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-amber-500 font-montserrat">
                  <Sparkles className="w-3 h-3 fill-amber-500" /> Web App
                </div>
                <h4 className="text-sm font-bold text-theme-heading font-montserrat">Install EbookVala App</h4>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-xl text-theme-muted hover:text-theme-heading hover:bg-theme-surface"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-theme-muted font-semibold leading-relaxed">
            Install EbookVala on your home screen for instant full-screen reading, offline access, and fast access!
          </p>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={handleDismiss}
              className="px-4 py-2 rounded-xl text-xs font-bold text-theme-muted hover:text-theme-heading"
            >
              Not Now
            </button>

            <button
              onClick={handleInstall}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white text-xs font-extrabold uppercase tracking-wide shadow-xl transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Install App</span>
            </button>
          </div>
        </div>
      )}

      {/* iOS Manual A2HS Tooltip Button (iOS Safari) */}
      {isIOS && !showIOSModal && (
        <div className="fixed bottom-4 right-4 z-40">
          <button
            onClick={() => setShowIOSModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-extrabold uppercase tracking-wide shadow-xl flex items-center gap-2 hover:scale-105 transition-all font-inter"
          >
            <Download className="w-4 h-4" />
            <span>Install on iOS</span>
          </button>
        </div>
      )}

      {/* iOS Manual Instructions Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm font-inter text-theme-text animate-fade-in">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-theme-card border border-theme glass-card shadow-2xl space-y-4 relative">
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute top-5 right-5 p-1 rounded-xl hover:bg-slate-500/10 text-theme-muted hover:text-theme-heading"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 text-amber-500">
              <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-theme-heading font-montserrat">Install on iPhone / iPad</h3>
            </div>

            <p className="text-xs text-theme-muted font-semibold leading-relaxed">
              To install EbookVala on your iOS device:
            </p>

            <ol className="space-y-3 text-xs font-semibold text-theme-heading">
              <li className="flex items-center gap-3 p-3 rounded-2xl bg-theme-surface/50 border border-theme/40">
                <Share className="w-5 h-5 text-blue-500 shrink-0" />
                <span>1. Tap the <strong>Share</strong> icon in your Safari toolbar</span>
              </li>

              <li className="flex items-center gap-3 p-3 rounded-2xl bg-theme-surface/50 border border-theme/40">
                <PlusSquare className="w-5 h-5 text-amber-500 shrink-0" />
                <span>2. Scroll down & select <strong>Add to Home Screen</strong></span>
              </li>
            </ol>

            <button
              onClick={handleDismiss}
              className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-white text-xs font-extrabold uppercase tracking-wide shadow-lg transition-all"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
}
