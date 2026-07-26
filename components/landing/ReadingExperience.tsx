'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Laptop, Tablet, Smartphone, Sun, Moon, Highlighter, Bookmark, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

export default function ReadingExperience() {
  const [deviceTab, setDeviceTab] = useState<'laptop' | 'tablet' | 'phone'>('laptop');
  const [readerDarkMode, setReaderDarkMode] = useState(true);
  const [isHighlighted, setIsHighlighted] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(true);
  const [page, setPage] = useState(42);

  return (
    <section id="reading-experience" className="py-24 bg-theme-surface border-y border-theme relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-primary-blue bg-blue-500/10 px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-accent-gold" /> Distraction-Free Reader
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-theme-heading font-montserrat mt-4 mb-4">
            Designed for Deep Focus Across Every Device
          </h2>
          <p className="text-base sm:text-lg text-theme-body">
            Experience ultra-smooth page transitions, custom typography, dark OLED modes, and instant cross-device sync.
          </p>
        </div>

        {/* Device Switcher Tabs & Interactive Reader Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10 p-2 rounded-2xl bg-theme-card border border-theme max-w-4xl mx-auto glass-card">
          {/* Device Selection */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setDeviceTab('laptop')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                deviceTab === 'laptop'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-theme-muted hover:text-theme-heading'
              }`}
            >
              <Laptop className="w-4 h-4" /> Laptop
            </button>
            <button
              onClick={() => setDeviceTab('tablet')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                deviceTab === 'tablet'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-theme-muted hover:text-theme-heading'
              }`}
            >
              <Tablet className="w-4 h-4" /> Tablet
            </button>
            <button
              onClick={() => setDeviceTab('phone')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                deviceTab === 'phone'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-theme-muted hover:text-theme-heading'
              }`}
            >
              <Smartphone className="w-4 h-4" /> Phone
            </button>
          </div>

          {/* Reader Interactive Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsHighlighted((prev) => !prev)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                isHighlighted
                  ? 'bg-yellow-400/20 text-yellow-600 border-yellow-400'
                  : 'text-theme-muted border-theme'
              }`}
            >
              <Highlighter className="w-3.5 h-3.5" /> Highlight Demo
            </button>

            <button
              onClick={() => setIsBookmarked((prev) => !prev)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                isBookmarked
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'text-theme-muted border-theme'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" /> Bookmark
            </button>

            <button
              onClick={() => setReaderDarkMode((prev) => !prev)}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-theme-heading border border-theme"
              aria-label="Toggle Reader Dark Mode"
            >
              {readerDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>
          </div>
        </div>

        {/* DEVICE MOCKUP CONTAINER */}
        <div className="flex justify-center items-center relative">
          <motion.div
            key={deviceTab}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className={`relative transition-all duration-500 rounded-3xl border-4 border-slate-800 shadow-2xl overflow-hidden ${
              deviceTab === 'laptop' ? 'w-full max-w-4xl aspect-[16/10]' : ''
            } ${deviceTab === 'tablet' ? 'w-full max-w-2xl aspect-[4/3]' : ''} ${
              deviceTab === 'phone' ? 'w-full max-w-sm aspect-[9/16]' : ''
            } ${readerDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-amber-50/90 text-slate-900'}`}
          >
            {/* Mockup Header Bar */}
            <div className={`flex items-center justify-between px-6 py-3 border-b text-xs ${readerDarkMode ? 'border-slate-800 bg-slate-900/60' : 'border-amber-200 bg-amber-100/60'}`}>
              <div className="flex items-center gap-2 font-bold font-montserrat">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
                <span className="ml-2">EbookVala Interactive Reader</span>
              </div>
              <div className="flex items-center gap-4">
                <span>Font: Inter • 16px</span>
                {isBookmarked && <Bookmark className="w-4 h-4 fill-blue-500 text-blue-500" />}
              </div>
            </div>

            {/* Mockup Reader Page Content */}
            <div className="p-6 sm:p-12 flex flex-col justify-between h-[calc(100%-48px)]">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-500 mb-2 block">
                  Chapter 4: The Compound Effect of Knowledge
                </span>
                <h3 className="text-xl sm:text-3xl font-extrabold font-montserrat mb-6">
                  Building Systems for Exponential Retention
                </h3>

                <p className="text-xs sm:text-base leading-relaxed mb-4 font-serif">
                  Great readers do not simply consume text line by line — they construct mental models that compound over decades. 
                  <span className={`transition-colors duration-300 px-1 rounded ${isHighlighted ? 'bg-yellow-400/30 text-yellow-300 font-semibold' : ''}`}>
                    &quot;When you combine active recall with daily 20-minute reading sessions, your comprehension increases by over 340% within 90 days.&quot;
                  </span>
                </p>

                <p className="text-xs sm:text-base leading-relaxed font-serif opacity-90 hidden sm:block">
                  By utilizing AI summarization alongside interactive chapter quizzes, you bridge the gap between passive reading and active execution.
                </p>
              </div>

              {/* Page Navigation Controls */}
              <div className={`flex items-center justify-between pt-4 border-t text-xs font-medium ${readerDarkMode ? 'border-slate-800' : 'border-amber-200'}`}>
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} className="flex items-center gap-1 hover:text-blue-500">
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>

                <span className="font-stats font-bold">Page {page} of 280</span>

                <button onClick={() => setPage((p) => p + 1)} className="flex items-center gap-1 hover:text-blue-500">
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </motion.div>
        </div>

      </div>
    </section>
  );
}
