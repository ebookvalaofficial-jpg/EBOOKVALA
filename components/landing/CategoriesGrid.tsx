'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  BookOpen, Sparkles, Zap, UserCheck, 
  Smile, Briefcase, ArrowRight, Code2 
} from 'lucide-react';
import { categories } from '@/data/categories';

// Static Icon Map by Category ID or Icon Name (Statically Analyzable by Turbopack)
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  fiction: BookOpen,
  'non-fiction': Sparkles,
  'self-help': Zap,
  biography: UserCheck,
  comic: Smile,
  'business-finance': Briefcase,
  coding: Code2,
  'coding-tech': Code2,
  BookOpen,
  Sparkles,
  Zap,
  UserCheck,
  Smile,
  Briefcase,
  Code2
};

export default function CategoriesGrid() {
  return (
    <section id="categories" className="py-24 bg-theme-bg relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-bold uppercase tracking-widest text-primary-blue bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20"
          >
            Curated Library
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-black text-theme-heading font-montserrat mt-4 mb-4"
          >
            Explore Poster Bento Categories
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-theme-body"
          >
            Handpicked collections structured for deep learning, professional growth, and personal mastery.
          </motion.p>
        </div>

        {/* 3-Per-Row Grid for 6 Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, idx) => {
            const IconComponent = CATEGORY_ICONS[cat.id] || CATEGORY_ICONS[cat.iconName] || BookOpen;

            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
              >
                <Link
                  href={`/books?category=${cat.id}`}
                  className={`relative rounded-3xl p-6 sm:p-8 border border-theme shadow-lg overflow-hidden group cursor-pointer bg-gradient-to-br ${cat.gradient} glass-card min-h-[240px] flex flex-col justify-between block hover:-translate-y-1.5 transition-all duration-300`}
                >
                  {/* Decorative Background Pattern */}
                  <div className="absolute inset-0 opacity-10 group-hover:opacity-25 transition-opacity bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

                  {/* Top Row: Icon + Book Count Badge */}
                  <div className="flex items-center justify-between relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 dark:bg-slate-900/40 backdrop-blur-md border border-white/20 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                      <IconComponent className="w-6 h-6 text-amber-400" />
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-900/60 text-white backdrop-blur-sm border border-slate-700/50">
                      {cat.bookCount}
                    </span>
                  </div>

                  {/* Bottom Content */}
                  <div className="relative z-10 mt-6">
                    <h3 className="font-extrabold text-white font-montserrat text-xl mb-1.5 group-hover:text-amber-300 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-slate-200 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                      {cat.description}
                    </p>

                    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-amber-400 opacity-90 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                      <span>Explore Books</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Hover Glow Effect */}
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
                </Link>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
