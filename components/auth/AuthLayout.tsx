'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles, Sun, Moon, Star, ShieldCheck, Zap, Bot, ArrowLeft } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-theme-bg text-theme-body flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Top Bar for Mobile & Desktop Header */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between z-20">
        <Link
          href="/"
          className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-1"
          aria-label="Back to EbookVala Home"
        >
          <div className="relative w-10 h-10 overflow-hidden rounded-xl bg-slate-900 border border-slate-700/50 shadow-md group-hover:scale-105 transition-transform duration-300">
            <Image
              src="/logo.png"
              alt="EbookVala Logo"
              fill
              sizes="40px"
              className="object-contain p-0.5"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl tracking-tight text-theme-heading font-montserrat flex items-center gap-1">
              Ebook<span className="text-primary-blue">Vala</span>
            </span>
            <span className="text-[10px] text-theme-muted font-medium -mt-1 hidden sm:inline-block">
              Next-Gen Marketplace & AI Reader
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-theme-muted hover:text-theme-heading transition-colors px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <button
            onClick={toggleTheme}
            className="p-2.5 text-theme-heading hover:text-primary-blue bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 border border-theme rounded-xl transition-all"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-yellow-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>
        </div>
      </header>

      {/* Main Split-Screen Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-theme-card border border-theme rounded-3xl shadow-2xl overflow-hidden glass-card">
          {/* LEFT COLUMN: Auth Form Slot */}
          <div className="lg:col-span-6 p-6 sm:p-10 lg:p-12 flex flex-col justify-between min-h-[580px]">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-primary-blue border border-blue-500/20 mb-4">
                  <ShieldCheck className="w-3.5 h-3.5" /> Secure Authentication
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-theme-heading font-montserrat tracking-tight">
                  {title}
                </h1>
                <p className="text-sm text-theme-muted mt-2 mb-8 leading-relaxed font-inter">
                  {subtitle}
                </p>
              </motion.div>

              {/* Form Render Slot */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                {children}
              </motion.div>
            </div>

            {/* Sub-footer inside Left Column */}
            <div className="pt-8 mt-8 border-t border-theme flex flex-wrap items-center justify-between gap-4 text-xs text-theme-muted">
              <span>&copy; {new Date().getFullYear()} EbookVala Inc.</span>
              <div className="flex items-center gap-4">
                <a href="#" className="hover:text-primary-blue transition-colors">Privacy Policy</a>
                <span>•</span>
                <a href="#" className="hover:text-primary-blue transition-colors">Terms of Service</a>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Branded Graphic & Testimonial Showcase (Desktop Only) */}
          <div className="hidden lg:flex lg:col-span-6 relative min-h-[640px] brand-gradient-bg p-10 flex-col justify-between overflow-hidden">
            {/* Background Glows & Pattern */}
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-900/30 rounded-full blur-3xl pointer-events-none" />

            {/* Top Badge */}
            <div className="relative z-10 flex items-center justify-between text-white/90">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20">
                <Sparkles className="w-4 h-4 text-yellow-300" /> Phase 2 Verified Auth System
              </span>
              <div className="flex items-center gap-1 bg-black/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>4.9 / 5.0 (2,400+ Readers)</span>
              </div>
            </div>

            {/* Animated Interactive Visual Showcase */}
            <div className="relative z-10 my-auto py-8 flex flex-col items-center justify-center text-center text-white">
              {/* Stacked Graphic Card */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center"
              >
                {/* Floating AI Chat Badge */}
                <motion.div
                  animate={{ y: [-6, 6, -6] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-4 -left-4 z-20 bg-slate-900/90 text-white p-3 rounded-2xl border border-blue-400/30 shadow-xl backdrop-blur-md flex items-center gap-2 text-xs text-left"
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="font-bold block">AI Chat with Book</span>
                    <span className="text-[10px] text-blue-200">Ask questions in real-time</span>
                  </div>
                </motion.div>

                {/* Floating Speed Summary Badge */}
                <motion.div
                  animate={{ y: [6, -6, 6] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -bottom-4 -right-4 z-20 bg-slate-900/90 text-white p-3 rounded-2xl border border-purple-400/30 shadow-xl backdrop-blur-md flex items-center gap-2 text-xs text-left"
                >
                  <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4 text-yellow-300" />
                  </div>
                  <div>
                    <span className="font-bold block">Instant Smart Summaries</span>
                    <span className="text-[10px] text-purple-200">10-min key takeaways</span>
                  </div>
                </motion.div>

                {/* Center Book Stack Visual */}
                <div className="w-48 h-56 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-purple-700 p-4 border border-white/20 shadow-2xl flex flex-col justify-between transform rotate-[-6deg] hover:rotate-0 transition-transform duration-500 group">
                  <div className="flex items-center justify-between">
                    <BookOpen className="w-8 h-8 text-white/80" />
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded text-white">
                      Bestseller
                    </span>
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-bold text-white font-montserrat">
                      Mastering Full-Stack AI Apps
                    </h3>
                    <p className="text-[11px] text-blue-100 mt-1">
                      By EbookVala Curators
                    </p>
                  </div>
                  <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-400 h-full w-4/5" />
                  </div>
                </div>
              </motion.div>

              <h2 className="mt-8 text-xl font-bold font-montserrat">
                Unlock Unlimited Knowledge & AI Reading
              </h2>
              <p className="text-xs text-white/80 max-w-sm mt-2 font-inter leading-relaxed">
                Join thousands of tech leaders, developers, and entrepreneurs expanding their skills with EbookVala.
              </p>
            </div>

            {/* Bottom Testimonial Box */}
            <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-white text-xs">
              <p className="italic text-white/90">
                &quot;EbookVala completely changed my daily routine. The instant AI summaries and seamless multi-device sync let me finish 3x more books every month!&quot;
              </p>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 font-bold flex items-center justify-center text-[10px] text-slate-900">
                    PG
                  </div>
                  <div>
                    <span className="font-bold block text-white text-[11px]">Prince Gajera</span>
                    <span className="text-[9px] text-white/70">Co-Founder, EbookVala</span>
                  </div>
                </div>
                <div className="flex items-center text-amber-300">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-300" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
