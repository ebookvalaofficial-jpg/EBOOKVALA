'use client';

import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { 
  Sparkles, Star, ArrowRight, BookOpen, ShieldCheck, 
  Zap, Smartphone
} from 'lucide-react';
import { heroQuoteCards } from '@/data/hero-quotes';
import { trackCTAClick } from '@/lib/analytics';
import StackedHeroCards from './StackedHeroCards';

const trustItems = [
  { 
    label: 'Secure & Private', 
    description: '256-bit encryption & privacy-first data', 
    icon: ShieldCheck, 
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    hoverGlow: 'hover:border-emerald-500/50 hover:shadow-emerald-500/15'
  },
  { 
    label: 'Instant Access', 
    description: 'Zero waiting — read immediately in browser or app', 
    icon: Zap, 
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    hoverGlow: 'hover:border-blue-500/50 hover:shadow-blue-500/15'
  },
  { 
    label: 'AI Enhanced', 
    description: 'Chat, summarize, and quiz any eBook in real-time', 
    icon: Sparkles, 
    color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    hoverGlow: 'hover:border-purple-500/50 hover:shadow-purple-500/15'
  },
  { 
    label: 'Multi-Device Sync', 
    description: 'Auto-sync highlights & bookmarks across web & mobile', 
    icon: Smartphone, 
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    hoverGlow: 'hover:border-amber-500/50 hover:shadow-amber-500/15'
  },
];

export default function Hero() {
  // Mouse Parallax for 3D Floating Book Stack
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 120 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const x = (e.clientX - rect.left) / width - 0.5;
    const y = (e.clientY - rect.top) / height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Count up numbers animated logic
  const [readersCount, setReadersCount] = useState(0);
  const [booksCount, setBooksCount] = useState(0);

  useEffect(() => {
    const duration = 1800;
    const steps = 45;
    const intervalTime = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      setReadersCount(Math.floor(50000 * progress));
      setBooksCount(Math.floor(10000 * progress));

      if (step >= steps) clearInterval(timer);
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  return (
    <section
      id="hero"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative pt-20 pb-12 md:pt-24 md:pb-16 overflow-hidden min-h-[85vh] flex flex-col justify-center bg-theme-bg"
    >
      {/* Background Gradient Mesh & Floating Glow Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-28 -left-20 w-[480px] h-[480px] rounded-full bg-blue-600/20 blur-3xl animate-pulse-glow" />
        <div className="absolute top-1/3 right-0 w-[520px] h-[520px] rounded-full bg-purple-600/15 blur-3xl animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
        <div className="absolute -bottom-24 left-1/3 w-96 h-96 rounded-full bg-yellow-400/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        {/* TOP HERO GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center mb-12">
          
          {/* LEFT COLUMN: Headings, Eyebrow, CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-theme-heading leading-[1.18] font-edu-hand mb-5"
            >
              Turn Every Page.{' '}
              <span className="brand-gradient-text">Into Real Progress.</span>
            </motion.h1>

            {/* Supporting Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-theme-body max-w-2xl leading-relaxed mb-7 font-merriweather font-normal"
            >
              Curated eBooks, AI insights, and smart tools that help you learn faster, think deeper, and live better.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mb-8"
            >
              <motion.a
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                href="#pricing"
                onClick={() => trackCTAClick('Start Reading Free', 'Hero')}
                className="px-8 py-4 rounded-xl text-base font-bold text-white brand-gradient-bg shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 flex items-center justify-center gap-2.5 group transition-all"
              >
                <span>Start Reading Free</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.a>

              <motion.a
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                href="#trending"
                className="px-8 py-4 rounded-xl text-base font-bold text-theme-heading bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-theme flex items-center justify-center gap-2.5 transition-all shadow-sm"
              >
                <BookOpen className="w-5 h-5 text-primary-blue" />
                <span>Explore Library</span>
              </motion.a>
            </motion.div>

            {/* Quick Stat Highlights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="pt-5 border-t border-theme w-full grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6"
            >
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-extrabold font-stats text-theme-heading">
                  {booksCount.toLocaleString()}+
                </span>
                <span className="text-xs text-theme-muted font-medium mt-0.5">Premium eBooks</span>
              </div>

              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-extrabold font-stats text-theme-heading">
                  {(readersCount / 1000).toFixed(0)}K+
                </span>
                <span className="text-xs text-theme-muted font-medium mt-0.5">Happy Readers</span>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1 text-accent-gold">
                  <span className="text-xl sm:text-2xl font-extrabold font-stats text-theme-heading">4.8/5</span>
                  <Star className="w-4 h-4 fill-accent-gold ml-0.5" />
                </div>
                <span className="text-xs text-theme-muted font-medium mt-0.5">User Rating</span>
              </div>

              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-extrabold font-stats text-secondary-purple">
                  AI Powered
                </span>
                <span className="text-xs text-theme-muted font-medium mt-0.5">Smart Learning</span>
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: Stacked Card Showcase */}
          <div className="lg:col-span-5 relative flex flex-col items-center justify-center">
            <StackedHeroCards cards={heroQuoteCards} />
          </div>

        </div>

        {/* BOTTOM TRUST GRID (4 ITEMS WITH ENHANCED HOVER & GLOW) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {trustItems.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                whileHover={{ y: -5, scale: 1.01 }}
                className={`p-5 rounded-2xl bg-gradient-to-b from-theme-card to-theme-card/80 border border-theme glass-card shadow-sm hover:shadow-xl ${item.hoverGlow} transition-all duration-300 flex items-start gap-3.5 group cursor-pointer`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${item.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-theme-heading font-montserrat group-hover:text-primary-blue transition-colors">
                    {item.label}
                  </h4>
                  <p className="text-xs text-theme-muted mt-0.5 leading-snug">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}
