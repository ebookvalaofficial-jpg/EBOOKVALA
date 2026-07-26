'use client';

import React, { useState } from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { Mail, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export default function NewsletterPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    setTimeout(() => {
      setStatus('success');
      setEmail('');
    }, 1000);
  };

  return (
    <main className="min-h-screen bg-theme-bg text-theme-body font-inter">
      <Navbar />

      <div className="pt-32 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-primary-blue bg-blue-500/10 px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-accent-gold" /> Weekly Knowledge Digest
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-theme-heading font-montserrat mt-4 mb-4">
            Subscribe to the EbookVala Insider
          </h1>
          <p className="text-sm sm:text-base text-theme-muted max-w-xl mx-auto leading-relaxed">
            Get curated book breakdowns, author interviews, AI reading tips, and exclusive discount codes delivered straight to your inbox every Friday.
          </p>
        </div>

        <div className="p-8 sm:p-12 rounded-3xl bg-theme-card border border-theme glass-card max-w-xl mx-auto shadow-2xl">
          {status === 'success' ? (
            <div className="space-y-4 py-6">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-theme-heading font-montserrat">
                You&apos;re On the List! 🎉
              </h2>
              <p className="text-xs text-theme-muted">
                Check your inbox for a welcome email with your free starter eBook summary bundle.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="w-5 h-5 text-theme-muted absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="Enter your personal or work email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-theme text-xs sm:text-sm text-theme-heading focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-3.5 rounded-xl text-sm font-bold text-white brand-gradient-bg shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 flex items-center justify-center gap-2 transition-all"
              >
                <span>{status === 'loading' ? 'Joining...' : 'Subscribe Free Now'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[11px] text-theme-muted">
                No spam. Unsubscribe anytime in 1-click. Join 25,000+ avid readers.
              </p>
            </form>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
