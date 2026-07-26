'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Code2, Rocket, BookOpenCheck, Download, Users, Library, Award } from 'lucide-react';

const personas = [
  { label: 'Students', icon: GraduationCap, color: 'text-blue-500 bg-blue-500/10' },
  { label: 'Developers', icon: Code2, color: 'text-purple-500 bg-purple-500/10' },
  { label: 'Entrepreneurs', icon: Rocket, color: 'text-amber-500 bg-amber-500/10' },
  { label: 'Avid Readers', icon: BookOpenCheck, color: 'text-emerald-500 bg-emerald-500/10' },
];

const stats = [
  { label: 'Curated eBooks', value: '10,000+', icon: Library, suffix: 'Titles Available' },
  { label: 'Active Readers', value: '50,000+', icon: Users, suffix: 'Worldwide' },
  { label: 'Top Authors', value: '500+', icon: Award, suffix: 'Expert Creators' },
  { label: 'eBook Downloads', value: '1,000,000+', icon: Download, suffix: 'Completed Reads' },
];

export default function TrustSection() {
  return (
    <section className="py-16 bg-theme-surface border-y border-theme relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Persona Strip */}
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-theme-muted">
            Empowering Readers Across All Domains
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-16">
          {personas.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group relative"
              >
                <div className="p-4 sm:p-5 rounded-2xl bg-theme-card border border-theme glass-card flex items-center justify-center gap-3 transition-all duration-300 filter grayscale group-hover:grayscale-0 hover:border-primary-blue shadow-xs hover:shadow-md animate-float" style={{ animationDelay: `${idx * 0.5}s` }}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-bold text-theme-heading group-hover:text-primary-blue transition-colors">
                    {item.label}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Statistics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="relative p-6 rounded-2xl bg-theme-card border border-theme shadow-md glass-card flex flex-col items-start hover:border-blue-500/40 transition-all group overflow-hidden"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-600/10 text-primary-blue flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-3xl sm:text-4xl font-extrabold text-theme-heading font-stats mb-1 group-hover:brand-gradient-text transition-all">
                  {stat.value}
                </span>
                <span className="text-sm font-bold text-theme-heading">
                  {stat.label}
                </span>
                <span className="text-xs text-theme-muted mt-0.5">
                  {stat.suffix}
                </span>

                {/* Soft Glow Pulse */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
