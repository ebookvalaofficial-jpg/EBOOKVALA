'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { trackCTAClick } from '@/lib/analytics';

export default function CTASection() {
  return (
    <section id="cta" className="py-24 bg-theme-bg relative overflow-hidden">
      {/* Background Animated Gradient Mesh & Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-amber-500/10 blur-3xl animate-pulse-glow" />
        <div className="absolute inset-0 bg-[radial-gradient(#2563eb_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-slate-700/60 p-8 sm:p-16 text-center text-white shadow-2xl relative overflow-hidden glass-card"
        >
          {/* Tagline */}
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5 fill-amber-400" /> Start Your Next Chapter
          </span>

          {/* Heading */}
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black font-montserrat leading-tight mb-6">
            Start Reading Today
          </h2>

          {/* Subheading */}
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Join over 50,000+ readers who are learning faster, thinking bigger, and building their futures with EbookVala.
          </p>

          {/* Primary CTA Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.a
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              href="#pricing"
              onClick={() => trackCTAClick('Create Free Account', 'CTA Section')}
              className="w-full sm:w-auto px-10 py-5 rounded-2xl text-base font-extrabold text-white brand-gradient-bg shadow-2xl shadow-blue-500/40 flex items-center justify-center gap-2 group transition-all"
            >
              Create Free Account
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.a>
          </div>

          {/* Trust Guarantees */}
          <div className="mt-10 pt-8 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Free 14-day trial
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Cancel anytime
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
