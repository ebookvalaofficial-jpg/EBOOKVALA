'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Share2, Code2, Sparkles, Globe } from 'lucide-react';
import { teamMembers } from '@/data/team';

export default function MeetOurTeam() {
  return (
    <section id="team" className="py-24 bg-theme-surface border-y border-theme relative overflow-hidden">
      {/* Glow Backdrop */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-bold uppercase tracking-widest text-primary-blue bg-blue-500/10 px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-accent-gold" /> Leadership & Vision
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-black text-theme-heading font-montserrat mt-4 mb-4"
          >
            Meet Our Team
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-theme-body"
          >
            The founders building EbookVala&apos;s future
          </motion.p>
        </div>

        {/* 2 Founders Cards Side-by-Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {teamMembers.map((member, idx) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              whileHover={{ y: -8 }}
              className="relative p-8 rounded-3xl bg-theme-card border border-theme glass-card shadow-xl flex flex-col items-center text-center group hover:border-blue-500/50 transition-all duration-300 overflow-hidden"
            >
              {/* Circular Avatar with Gradient Ring Border */}
              <div className="relative w-32 h-32 mb-6 p-1 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 shadow-lg group-hover:scale-105 transition-transform duration-300">
                <div className="relative w-full h-full rounded-full overflow-hidden bg-slate-900">
                  <Image
                    src={member.avatar}
                    alt={member.name}
                    fill
                    sizes="128px"
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Name & Title */}
              <h3 className="text-2xl font-black text-theme-heading font-montserrat mb-1 group-hover:text-primary-blue transition-colors">
                {member.name}
              </h3>
              <span className="text-xs font-bold text-primary-blue uppercase tracking-wider bg-blue-500/10 px-3 py-1 rounded-full mb-4">
                {member.role}
              </span>

              {/* Bio */}
              <p className="text-sm text-theme-body leading-relaxed font-inter">
                {member.bio}
              </p>

              {/* Hover Glow Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
