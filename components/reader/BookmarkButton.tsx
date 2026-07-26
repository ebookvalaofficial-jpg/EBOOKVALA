'use client';

import React from 'react';
import { Bookmark } from 'lucide-react';

interface BookmarkButtonProps {
  isBookmarked: boolean;
  onToggle: () => void;
}

export default function BookmarkButton({ isBookmarked, onToggle }: BookmarkButtonProps) {
  return (
    <button
      onClick={onToggle}
      className={`p-2 rounded-xl border transition-all ${
        isBookmarked
          ? 'bg-rose-500/10 border-rose-500/30 text-rose-500 scale-105'
          : 'bg-theme-surface border-theme/60 text-theme-heading hover:bg-slate-500/10'
      }`}
      aria-label={isBookmarked ? 'Remove Bookmark' : 'Add Bookmark'}
    >
      <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-rose-500' : ''}`} />
    </button>
  );
}
