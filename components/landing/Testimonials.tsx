'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star, Quote, Sparkles } from 'lucide-react';
import { testimonials } from '@/data/testimonials';

export default function Testimonials() {
  // Duplicate list to create seamless infinite scrolling marquee
  const duplicatedTestimonials = [...testimonials, ...testimonials];

  return (
    <section id="testimonials" className="py-24 bg-theme-surface border-y border-theme relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-primary-blue bg-blue-500/10 px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-accent-gold" /> Global Reader Community
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-theme-heading font-montserrat mt-4 mb-4">
            Loved by 50,000+ Readers Across India & UAE
          </h2>
          <p className="text-base sm:text-lg text-theme-body">
            Here is how EbookVala is helping students, software engineers, founders, and professionals learn and grow daily.
          </p>
        </div>
      </div>

      {/* Infinite Auto-Rotating Marquee Slider */}
      <div className="relative w-full overflow-hidden py-4">
        {/* Gradient Overlay Shadows for Marquee Fade */}
        <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-theme-surface to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-theme-surface to-transparent z-10 pointer-events-none" />

        <div className="animate-marquee flex gap-6">
          {duplicatedTestimonials.map((t, idx) => (
            <div
              key={`${t.id}-${idx}`}
              className="w-[320px] sm:w-[380px] shrink-0 p-6 rounded-3xl bg-theme-card border border-theme glass-card shadow-lg flex flex-col justify-between hover:border-blue-500/40 transition-all duration-300 group"
            >
              <div>
                {/* Rating & Quote Icon */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                    <span className="text-xs font-bold text-theme-heading ml-1.5">
                      {t.rating.toFixed(1)}
                    </span>
                  </div>
                  <Quote className="w-6 h-6 text-primary-blue/30 group-hover:text-primary-blue transition-colors" />
                </div>

                {/* Comment */}
                <p className="text-xs sm:text-sm text-theme-body leading-relaxed mb-6 italic">
                  &quot;{t.comment}&quot;
                </p>
              </div>

              {/* User Avatar & Info */}
              <div className="flex items-center gap-3 pt-4 border-t border-theme">
                <div className="relative w-11 h-11 rounded-full overflow-hidden bg-slate-800 shrink-0 border border-theme shadow-xs">
                  <Image
                    src={t.avatar}
                    alt={t.name}
                    fill
                    sizes="44px"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-theme-heading font-montserrat truncate group-hover:text-primary-blue transition-colors">
                    {t.name}
                  </span>
                  <span className="text-xs text-theme-muted truncate">
                    {t.profession} • <strong className="text-primary-blue font-normal">{t.location}</strong>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
