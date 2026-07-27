'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, Star, BookOpen, Download } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[#050913] text-white flex flex-col lg:flex-row selection:bg-blue-600 selection:text-white">
      {/* LEFT COLUMN: Hero & Branding Section */}
      <div className="w-full lg:w-1/2 bg-[#0b1426] border-b lg:border-b-0 lg:border-r border-slate-800/80 p-8 sm:p-12 lg:p-16 flex flex-col justify-between min-h-[480px] lg:min-h-screen">
        
        {/* Top Logo + Brand */}
        <div>
          <Link href="/" className="inline-flex items-center gap-3 group focus:outline-none">
            <div className="relative w-9 h-9 overflow-hidden rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center p-1">
              <Image
                src="/logo.png"
                alt="EbookVala Logo"
                width={32}
                height={32}
                className="object-contain"
                priority
              />
            </div>
            <span className="font-extrabold text-xl tracking-wider text-white uppercase font-montserrat">
              EBOOKVALA
            </span>
          </Link>

          {/* Badge */}
          <div className="mt-8 sm:mt-12">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-widest font-mono">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              100% Free Open Library
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15] mt-6 font-montserrat">
            Read the minds <br className="hidden sm:inline" />
            of the masters.
          </h1>

          {/* Subtitle / Description */}
          <p className="text-sm sm:text-base text-slate-300/80 mt-5 max-w-lg leading-relaxed font-inter">
            EBOOKVALA offers a premium digital sanctuary for voracious readers and an open, clutter-free publishing canvas for independent authors.
          </p>

          <div className="my-8 border-t border-slate-800/80" />

          {/* Social Proof & Features */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <span className="text-slate-200">4.9/5 Rated by 50,000+ Readers</span>
            </div>

            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-300 font-medium">
              <BookOpen className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Unlimited Digital Reading & Study Analytics</span>
            </div>

            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-300 font-medium">
              <Download className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Instant Local Downloads & Lifetime Access</span>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-12 pt-6 text-[11px] font-mono tracking-widest text-slate-500 uppercase">
          &copy; {new Date().getFullYear()} EBOOKVALA. ALL RIGHTS RESERVED.
        </div>
      </div>

      {/* RIGHT COLUMN: Form Slot */}
      <div className="w-full lg:w-1/2 bg-[#050913] p-8 sm:p-12 lg:p-16 flex flex-col justify-center min-h-[500px] lg:min-h-screen">
        <div className="max-w-md w-full mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
