'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Settings, PanelRight, Flame, BookOpen, Bookmark, Sparkles } from 'lucide-react';
import BookmarkButton from './BookmarkButton';

interface ReaderHeaderProps {
  bookTitle: string;
  chapterTitle: string;
  progressPercent: number;
  currentStreak: number;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onOpenSettings: () => void;
  onToggleSidebar: () => void;
  onToggleAITools?: () => void;
}

export default function ReaderHeader({
  bookTitle,
  chapterTitle,
  progressPercent,
  currentStreak,
  isBookmarked,
  onToggleBookmark,
  onOpenSettings,
  onToggleSidebar,
  onToggleAITools,
}: ReaderHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 border-b border-theme/60 bg-theme-card/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* Left: Back & Title */}
      <div className="flex items-center gap-3 min-w-0">
        <Link
          href="/books"
          className="p-2 rounded-xl text-theme-muted hover:text-theme-heading hover:bg-slate-500/10 transition-colors shrink-0"
          aria-label="Back to Store"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <div className="min-w-0">
          <h1 className="text-xs sm:text-sm font-bold text-theme-heading truncate font-montserrat">{bookTitle}</h1>
          <span className="text-[11px] text-theme-muted truncate block">{chapterTitle}</span>
        </div>
      </div>

      {/* Right: Controls & Badges */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* AI Tools Trigger */}
        {onToggleAITools && (
          <button
            onClick={onToggleAITools}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-500 hover:scale-105 text-xs font-black transition-all shadow-sm"
            title="AI Reading Tools"
          >
            <Sparkles className="w-3.5 h-3.5 fill-amber-500" />
            <span className="hidden md:inline">AI Tools</span>
          </button>
        )}

        {/* Streak Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-extrabold font-stats">
          <Flame className="w-3.5 h-3.5 fill-amber-500" />
          <span>{currentStreak} Day Streak</span>
        </div>

        {/* Progress % Pill */}
        <div className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-primary-blue text-xs font-extrabold font-stats">
          {Math.round(progressPercent)}% Read
        </div>

        {/* Bookmark Action */}
        <BookmarkButton isBookmarked={isBookmarked} onToggle={onToggleBookmark} />

        {/* Settings Trigger */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl text-theme-heading hover:bg-slate-500/10 border border-theme/60 transition-colors"
          aria-label="Reader Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Sidebar Trigger */}
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-theme-heading hover:bg-slate-500/10 border border-theme/60 transition-colors"
          aria-label="Toggle Sidebar"
        >
          <PanelRight className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
