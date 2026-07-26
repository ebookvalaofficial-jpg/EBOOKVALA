'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  WifiOff, Flame, Bookmark, Highlighter, 
  Languages, Trophy, Sparkles, Smartphone, BarChart3, Book 
} from 'lucide-react';
import { featuresList } from '@/data/features';

const iconMap: Record<string, React.ElementType> = {
  WifiOff,
  Flame,
  Bookmark,
  Highlighter,
  Languages,
  Trophy,
  Sparkles,
  Smartphone,
  BarChart3,
  Book
};

export default function FeaturesGrid() {
  return (
    <section id="features" className="py-24 bg-theme-bg relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-primary-blue bg-blue-500/10 px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-accent-gold" /> Everything You Need
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-theme-heading font-montserrat mt-4 mb-4">
            {featuresList.length} Power Features Built for Serious Readers
          </h2>
          <p className="text-base sm:text-lg text-theme-body">
            A comprehensive suite of tools engineered to transform how you absorb, retain, and apply knowledge daily.
          </p>
        </div>

        {/* 8 Features Grid (2 Rows of 4 Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuresList.map((feat, idx) => {
            const Icon = iconMap[feat.iconName] || Book;
            return (
              <motion.div
                key={feat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                whileHover={{ y: -6 }}
                className="p-6 rounded-3xl bg-theme-card border border-theme glass-card shadow-sm hover:shadow-2xl hover:border-blue-500/60 dark:hover:border-blue-400/60 transition-all duration-300 group relative overflow-hidden cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-primary-blue flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-gradient-to-tr group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-500/30 transition-all duration-300">
                  <Icon className="w-6 h-6 transition-transform duration-300" />
                </div>

                <h3 className="text-lg font-bold text-theme-heading font-montserrat mb-2 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                  {feat.title}
                </h3>
                <p className="text-xs sm:text-sm text-theme-body leading-relaxed">
                  {feat.description}
                </p>

                {/* Vivid Hover Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-blue-500/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
