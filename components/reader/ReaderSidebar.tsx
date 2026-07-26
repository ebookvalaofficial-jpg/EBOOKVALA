'use client';

import React, { useState } from 'react';
import { X, BookOpen, Bookmark as BookmarkIcon, Highlighter, Trash2, Edit2, CheckCircle2 } from 'lucide-react';
import { HighlightingColor } from './ReaderContent';

export interface SidebarChapter {
  id: string;
  order: number;
  title: string;
  wordCount: number;
}

export interface SidebarBookmark {
  id: string;
  chapterId: string;
  scrollPositionPercent: number;
  label?: string | null;
  chapterTitle: string;
  createdAt: string;
}

export interface SidebarHighlight {
  id: string;
  chapterId: string;
  selectedText: string;
  color: HighlightingColor;
  note?: string | null;
  chapterTitle: string;
  createdAt: string;
}

interface ReaderSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  chapters: SidebarChapter[];
  bookmarks: SidebarBookmark[];
  highlights: SidebarHighlight[];
  currentChapterId: string;
  onSelectChapter: (chapterId: string) => void;
  onSelectBookmark: (bookmark: SidebarBookmark) => void;
  onSelectHighlight: (highlight: SidebarHighlight) => void;
  onDeleteBookmark: (bookmarkId: string) => void;
  onDeleteHighlight: (highlightId: string) => void;
}

const colorPillMap: Record<HighlightingColor, string> = {
  YELLOW: 'bg-amber-400',
  GREEN: 'bg-emerald-400',
  BLUE: 'bg-sky-400',
  PINK: 'bg-rose-400',
};

export default function ReaderSidebar({
  isOpen,
  onClose,
  chapters,
  bookmarks,
  highlights,
  currentChapterId,
  onSelectChapter,
  onSelectBookmark,
  onSelectHighlight,
  onDeleteBookmark,
  onDeleteHighlight,
}: ReaderSidebarProps) {
  const [activeTab, setActiveTab] = useState<'toc' | 'bookmarks' | 'notes'>('toc');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-xs animate-fade-in" data-lenis-prevent>
      <div className="w-full max-w-sm h-full bg-theme-card border-l border-theme p-6 overflow-y-auto space-y-6 shadow-2xl glass-card text-theme-text flex flex-col justify-between">
        {/* Header & Tabs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-theme/60">
            <h3 className="text-base font-bold text-theme-heading font-montserrat">Reader Navigation</h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-theme-muted hover:text-theme-heading hover:bg-slate-500/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-theme-surface p-1 rounded-2xl border border-theme/60 text-xs font-bold">
            <button
              onClick={() => setActiveTab('toc')}
              className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'toc' ? 'bg-blue-600 text-white shadow-md' : 'text-theme-muted hover:text-theme-heading'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" /> Contents
            </button>
            <button
              onClick={() => setActiveTab('bookmarks')}
              className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'bookmarks' ? 'bg-blue-600 text-white shadow-md' : 'text-theme-muted hover:text-theme-heading'
              }`}
            >
              <BookmarkIcon className="w-3.5 h-3.5" /> Bookmarks ({bookmarks.length})
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'notes' ? 'bg-blue-600 text-white shadow-md' : 'text-theme-muted hover:text-theme-heading'
              }`}
            >
              <Highlighter className="w-3.5 h-3.5" /> Notes ({highlights.length})
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto my-2 pr-1 space-y-2">
          {/* TAB 1: Table of Contents */}
          {activeTab === 'toc' && (
            <div className="space-y-1.5">
              {chapters.map((chap) => {
                const isCurrent = chap.id === currentChapterId;
                return (
                  <button
                    key={chap.id}
                    onClick={() => {
                      onSelectChapter(chap.id);
                      onClose();
                    }}
                    className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between gap-2 ${
                      isCurrent
                        ? 'bg-blue-500/10 border-blue-500/30 text-primary-blue font-bold shadow-xs'
                        : 'bg-theme-surface border-theme/40 text-theme-heading hover:bg-slate-500/10'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-theme-muted block">
                        Chapter {chap.order}
                      </span>
                      <h4 className="text-xs truncate font-montserrat mt-0.5">{chap.title}</h4>
                    </div>
                    {isCurrent && <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* TAB 2: Bookmarks */}
          {activeTab === 'bookmarks' && (
            <div className="space-y-2">
              {bookmarks.length === 0 ? (
                <div className="p-8 text-center text-xs text-theme-muted">
                  No bookmarks added yet. Click the bookmark icon in the header to save positions.
                </div>
              ) : (
                bookmarks.map((bm) => (
                  <div
                    key={bm.id}
                    className="p-3 rounded-2xl bg-theme-surface border border-theme/60 flex items-start justify-between gap-2"
                  >
                    <button
                      onClick={() => {
                        onSelectBookmark(bm);
                        onClose();
                      }}
                      className="text-left flex-1 min-w-0"
                    >
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary-blue block">
                        {bm.chapterTitle} ({Math.round(bm.scrollPositionPercent)}%)
                      </span>
                      <p className="text-xs font-semibold text-theme-heading truncate mt-0.5">{bm.label || 'Saved Bookmark'}</p>
                      <span className="text-[10px] text-theme-muted block mt-1">
                        {new Date(bm.createdAt).toLocaleDateString()}
                      </span>
                    </button>
                    <button
                      onClick={() => onDeleteBookmark(bm.id)}
                      className="p-1 rounded-lg text-theme-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: Highlights & Notes */}
          {activeTab === 'notes' && (
            <div className="space-y-2">
              {highlights.length === 0 ? (
                <div className="p-8 text-center text-xs text-theme-muted">
                  No highlights or notes yet. Select text in any chapter to highlight and annotate.
                </div>
              ) : (
                highlights.map((hl) => (
                  <div
                    key={hl.id}
                    className="p-3 rounded-2xl bg-theme-surface border border-theme/60 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${colorPillMap[hl.color]}`} />
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-theme-muted">
                          {hl.chapterTitle}
                        </span>
                      </div>
                      <button
                        onClick={() => onDeleteHighlight(hl.id)}
                        className="p-1 rounded-lg text-theme-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p
                      onClick={() => {
                        onSelectHighlight(hl);
                        onClose();
                      }}
                      className="text-xs text-theme-heading italic line-clamp-3 cursor-pointer hover:underline"
                    >
                      &ldquo;{hl.selectedText}&rdquo;
                    </p>

                    {hl.note && (
                      <div className="p-2 rounded-xl bg-theme-card border border-theme/40 text-xs font-semibold text-primary-blue">
                        Note: {hl.note}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl text-xs font-bold text-theme-heading bg-slate-500/10 hover:bg-slate-500/20 border border-theme/60 transition-colors"
        >
          Close Sidebar
        </button>
      </div>
    </div>
  );
}
