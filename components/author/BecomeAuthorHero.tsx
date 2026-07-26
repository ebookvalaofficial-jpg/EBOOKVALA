'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, Sparkles, DollarSign, Award, ArrowRight, ShieldCheck } from 'lucide-react';

export default function BecomeAuthorHero() {
  return (
    <div className="relative overflow-hidden pt-12 pb-16 sm:py-24 text-theme-text font-inter">
      {/* Dynamic Background Glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-tr from-amber-500/20 to-orange-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 space-y-12">
        {/* Main Title Section */}
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-black uppercase tracking-wider font-montserrat shadow-sm">
            <Sparkles className="w-4 h-4 fill-amber-500" />
            <span>Join EbookVala Author Guild</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-theme-heading font-montserrat tracking-tight leading-tight">
            Publish Your Book. <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-orange-500 to-red-500">
              Keep 70% Royalties.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-theme-muted font-semibold leading-relaxed">
            Turn your ideas into income. Reach thousands of eager readers on India&apos;s premier next-generation eBook & AI reading platform.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/become-an-author/apply"
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-extrabold text-sm tracking-wide uppercase shadow-xl hover:scale-105 transition-all flex items-center gap-2"
            >
              <span>Apply as Author Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="p-6 rounded-3xl bg-theme-card border border-theme glass-card space-y-3 text-center shadow-lg">
            <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-500 w-max mx-auto border border-amber-500/20">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-theme-heading font-montserrat">Industry-Leading Royalties</h3>
            <p className="text-xs text-theme-muted leading-relaxed">
              Earn a guaranteed <strong>70% royalty</strong> on every eBook sale. Transparent tracking and direct bank payout requests.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-theme-card border border-theme glass-card space-y-3 text-center shadow-lg">
            <div className="p-3.5 rounded-2xl bg-blue-500/10 text-blue-500 w-max mx-auto border border-blue-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-theme-heading font-montserrat">Built-in AI Companion</h3>
            <p className="text-xs text-theme-muted leading-relaxed">
              Your books automatically feature AI Chapter Summaries, Flashcards, Quizzes, and Voice Narration for enhanced reader engagement.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-theme-card border border-theme glass-card space-y-3 text-center shadow-lg">
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-500 w-max mx-auto border border-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-theme-heading font-montserrat">Full Creative Ownership</h3>
            <p className="text-xs text-theme-muted leading-relaxed">
              You retain 100% of your copyright. Edit draft manuscripts, adjust pricing, and view real-time reader analytics anytime.
            </p>
          </div>
        </div>

        {/* 3-Step Process */}
        <div className="p-8 rounded-3xl bg-theme-surface/50 border border-theme/60 space-y-6">
          <h2 className="text-xl font-bold text-theme-heading font-montserrat text-center">
            How It Works in 3 Simple Steps
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center text-xs">
            <div className="space-y-2">
              <span className="w-8 h-8 rounded-full bg-amber-500 text-white font-extrabold flex items-center justify-center mx-auto shadow-md">
                1
              </span>
              <h4 className="font-bold text-theme-heading">Submit Application</h4>
              <p className="text-theme-muted">Fill out your pen name, bio, and writing sample. Admin reviews applications within 24-48 hours.</p>
            </div>

            <div className="space-y-2">
              <span className="w-8 h-8 rounded-full bg-amber-500 text-white font-extrabold flex items-center justify-center mx-auto shadow-md">
                2
              </span>
              <h4 className="font-bold text-theme-heading">Publish Your Book</h4>
              <p className="text-theme-muted">Write or upload manuscript chapters. Submit for review, and on approval your book goes live in the store.</p>
            </div>

            <div className="space-y-2">
              <span className="w-8 h-8 rounded-full bg-amber-500 text-white font-extrabold flex items-center justify-center mx-auto shadow-md">
                3
              </span>
              <h4 className="font-bold text-theme-heading">Earn & Get Paid</h4>
              <p className="text-theme-muted">Track royalties in real time. Request payouts directly to your bank once payable balance reaches ₹500.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
