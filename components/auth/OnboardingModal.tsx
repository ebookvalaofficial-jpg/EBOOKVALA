'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, PenTool, Sparkles, CheckCircle2, ArrowRight, X } from 'lucide-react';

export default function OnboardingModal() {
  const { data: session, status } = useSession();
  const router = RouterHook();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'READER' | 'AUTHOR'>('READER');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Don't show modal on auth pages or admin pages
    if (status !== 'authenticated' || !session?.user) return;
    if (pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/admin')) return;

    let isMounted = true;
    const checkOnboarding = async () => {
      try {
        const res = await fetch('/api/user/onboarding');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && !data.onboardingCompleted) {
            setIsOpen(true);
          }
        }
      } catch (err) {
        console.error('Failed to check onboarding status:', err);
      }
    };

    checkOnboarding();
    return () => {
      isMounted = false;
    };
  }, [status, session, pathname]);

  const handleCompleteOnboarding = async (choice: 'READER' | 'AUTHOR' | 'SKIP') => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ choice }),
      });

      const data = await res.json();
      setIsOpen(false);

      if (res.ok && data.redirectUrl) {
        router.push(data.redirectUrl);
      }
    } catch (err) {
      console.error('Onboarding submission error:', err);
      setIsOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 text-white space-y-6"
        >
          {/* Top Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider font-montserrat">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Welcome to EbookVala</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-montserrat text-white">
              How will you use EbookVala?
            </h2>

            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
              Select your primary goal to help us tailor your experience. You can explore both reader and author features anytime.
            </p>
          </div>

          {/* Role Choice Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* READER CARD */}
            <div
              onClick={() => setSelectedRole('READER')}
              className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-4 group ${
                selectedRole === 'READER'
                  ? 'bg-blue-600/10 border-blue-500 shadow-lg shadow-blue-500/10'
                  : 'bg-slate-800/50 border-slate-700/80 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                  <BookOpen className="w-5 h-5" />
                </div>

                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedRole === 'READER' ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-600'
                }`}>
                  {selectedRole === 'READER' && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-base text-white font-montserrat">I&apos;m a Reader</h3>
                  <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md">Default</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Browse, buy, and read books. Access AI reading assistants, audiobooks, and community book clubs.
                </p>
              </div>
            </div>

            {/* AUTHOR CARD */}
            <div
              onClick={() => setSelectedRole('AUTHOR')}
              className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-4 group ${
                selectedRole === 'AUTHOR'
                  ? 'bg-purple-600/10 border-purple-500 shadow-lg shadow-purple-500/10'
                  : 'bg-slate-800/50 border-slate-700/80 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                  <PenTool className="w-5 h-5" />
                </div>

                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedRole === 'AUTHOR' ? 'border-purple-500 bg-purple-500 text-white' : 'border-slate-600'
                }`}>
                  {selectedRole === 'AUTHOR' && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-base text-white font-montserrat">I&apos;m an Author</h3>
                  <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md">Publish & Earn</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Publish and sell your own eBooks, view real-time royalty analytics, and reach thousands of readers.
                </p>
              </div>
            </div>
          </div>

          {/* Action Button & Skip */}
          <div className="space-y-3 pt-2">
            <button
              onClick={() => handleCompleteOnboarding(selectedRole)}
              disabled={isSubmitting}
              className={`w-full py-3.5 px-6 rounded-2xl text-xs sm:text-sm font-extrabold text-white shadow-xl transition-all flex items-center justify-center gap-2 ${
                selectedRole === 'AUTHOR'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-500/25'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/25'
              }`}
            >
              <span>{selectedRole === 'AUTHOR' ? 'Apply to Become an Author' : 'Get Started as Reader'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleCompleteOnboarding('SKIP')}
              disabled={isSubmitting}
              className="w-full py-2.5 text-center text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors"
            >
              Skip for now, I&apos;ll decide later
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function RouterHook() {
  return useRouter();
}
