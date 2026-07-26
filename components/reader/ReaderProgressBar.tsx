'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ReaderProgressBarProps {
  currentChapterOrder: number;
  totalChapters: number;
  progressPercent: number;
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export default function ReaderProgressBar({
  currentChapterOrder,
  totalChapters,
  progressPercent,
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
}: ReaderProgressBarProps) {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 bg-theme-card/90 backdrop-blur-md border-t border-theme/60 py-2.5 px-4 sm:px-6 transition-colors">
      {/* Progress Fill Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-slate-500/20">
        <div
          className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300"
          style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
        />
      </div>

      <div className="max-w-4xl mx-auto flex items-center justify-between text-xs font-semibold">
        {/* Previous Chapter */}
        <button
          onClick={onPrevious}
          disabled={!hasPrevious}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-theme/60 text-theme-heading hover:bg-slate-500/10 disabled:opacity-40 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Prev Chapter</span>
        </button>

        {/* Center Chapter Indicator */}
        <span className="text-theme-muted font-stats font-bold">
          Chapter {currentChapterOrder} of {totalChapters} ({Math.round(progressPercent)}%)
        </span>

        {/* Next Chapter */}
        <button
          onClick={onNext}
          disabled={!hasNext}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-theme/60 text-theme-heading hover:bg-slate-500/10 disabled:opacity-40 transition-colors"
        >
          <span className="hidden sm:inline">Next Chapter</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </footer>
  );
}
