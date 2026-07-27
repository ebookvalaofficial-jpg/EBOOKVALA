'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, User, Tag, Sparkles, Layers } from 'lucide-react';

export interface BookHoverPreviewProps {
  title: string;
  authorName: string;
  categoryName: string;
  collectionName?: string;
  rating?: number;
  description?: string;
  isVisible: boolean;
}

export default function BookHoverPreview({
  title,
  authorName,
  categoryName,
  collectionName = 'Bestseller',
  rating,
  description,
  isVisible,
}: BookHoverPreviewProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 8 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 sm:w-72 bg-slate-900/95 dark:bg-slate-950/95 border border-slate-700/80 shadow-2xl rounded-2xl p-4 text-white z-50 pointer-events-none backdrop-blur-xl space-y-2.5 hidden sm:block"
        >
          {/* Arrow pointing down */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1.5 border-8 border-transparent border-t-slate-900/95 dark:border-t-slate-950/95" />

          {/* Collection / Badge Pill */}
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 border border-amber-400/30 text-amber-400">
              <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>{collectionName}</span>
            </span>
            {rating && (
              <span className="text-[11px] font-bold text-amber-400">
                ★ {rating.toFixed(1)}
              </span>
            )}
          </div>

          {/* 1. Book Name */}
          <div>
            <h4 className="text-sm font-extrabold text-white font-montserrat line-clamp-2 leading-tight">
              {title}
            </h4>
          </div>

          {/* Metadata Rows */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs text-slate-300">
            {/* 2. By Author */}
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="text-slate-400">By:</span>
              <span className="font-semibold text-slate-100 truncate">{authorName}</span>
            </div>

            {/* 3. Topic Category */}
            <div className="flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="text-slate-400">Topic:</span>
              <span className="font-semibold text-slate-100 truncate">{categoryName}</span>
            </div>

            {/* 4. Collection */}
            <div className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-slate-400">Collections:</span>
              <span className="font-semibold text-slate-100 truncate">{collectionName}</span>
            </div>
          </div>

          {description && (
            <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed italic pt-1 border-t border-slate-800/80">
              &quot;{description}&quot;
            </p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
