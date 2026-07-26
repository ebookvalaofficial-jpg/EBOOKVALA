'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReaderHeader from './ReaderHeader';
import ReaderContent, { HighlightingColor } from './ReaderContent';
import ReaderProgressBar from './ReaderProgressBar';
import ReaderSettings, { ReaderSettingsState } from './ReaderSettings';
import ReaderSidebar, { SidebarChapter, SidebarBookmark, SidebarHighlight } from './ReaderSidebar';
import { Sparkles, CheckCircle2 } from 'lucide-react';

import AIChatPanel from './ai/AIChatPanel';
import AISummaryCard from './ai/AISummaryCard';
import FlashcardsView from './ai/FlashcardsView';
import QuizView from './ai/QuizView';
import TranslatorPanel from './ai/TranslatorPanel';
import VoiceNarratorPlayer from './ai/VoiceNarratorPlayer';

export interface ReaderBookData {
  id: string;
  slug: string;
  title: string;
  coverImageUrl: string;
  authorName: string;
  chapters: Array<{
    id: string;
    order: number;
    title: string;
    content: string;
    wordCount: number;
  }>;
}

interface ReaderShellProps {
  book: ReaderBookData;
  userPlan?: string;
  initialProgress?: {
    currentChapterId?: string;
    scrollPositionPercent?: number;
    percentComplete?: number;
  } | null;
  initialStreak?: {
    currentStreak: number;
  } | null;
  initialBookmarks?: SidebarBookmark[];
  initialHighlights?: SidebarHighlight[];
}

const defaultSettings: ReaderSettingsState = {
  fontSize: 'medium',
  fontFamily: 'serif',
  lineHeight: 'comfortable',
  marginWidth: 'medium',
  theme: 'sepia',
};

export default function ReaderShell({
  book,
  userPlan = 'FREE',
  initialProgress,
  initialStreak,
  initialBookmarks = [],
  initialHighlights = [],
}: ReaderShellProps) {
  const chapters = book.chapters || [];
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [settings, setSettings] = useState<ReaderSettingsState>(defaultSettings);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAIToolsOpen, setIsAIToolsOpen] = useState(false);
  const [activeAITab, setActiveAITab] = useState<'SUMMARY' | 'FLASHCARDS' | 'QUIZ' | 'TRANSLATOR' | 'NARRATOR'>('SUMMARY');
  const [scrollPercent, setScrollPercent] = useState(0);
  const [bookmarks, setBookmarks] = useState<SidebarBookmark[]>(initialBookmarks);
  const [highlights, setHighlights] = useState<SidebarHighlight[]>(initialHighlights);
  const [streakCount, setStreakCount] = useState(initialStreak?.currentStreak || 1);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Restore User Reader Settings from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ebookvala_reader_settings');
      if (saved) {
        setSettings((prev) => ({ ...prev, ...JSON.parse(saved) }));
      }
    } catch (e) {
      console.warn('Could not read reader settings from localStorage:', e);
    }
  }, []);

  const updateSettings = (newPartial: Partial<ReaderSettingsState>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newPartial };
      try {
        localStorage.setItem('ebookvala_reader_settings', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // Resume from saved initial progress
  useEffect(() => {
    if (initialProgress?.currentChapterId) {
      const foundIdx = chapters.findIndex((c) => c.id === initialProgress.currentChapterId);
      if (foundIdx !== -1) {
        setCurrentChapterIndex(foundIdx);
        setToastMsg(`Resuming from Chapter ${chapters[foundIdx].order}`);
        setTimeout(() => setToastMsg(null), 3500);
      }
    }
  }, [initialProgress, chapters]);

  const currentChapter = chapters[currentChapterIndex] || chapters[0];
  const overallPercent = Math.round(
    ((currentChapterIndex + scrollPercent / 100) / (chapters.length || 1)) * 100
  );

  // Save Progress API call (debounced)
  const saveProgress = useCallback(
    async (chapId: string, scrollPct: number, overallPct: number) => {
      try {
        const res = await fetch(`/api/reader/${book.id}/progress`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentChapterId: chapId,
            scrollPositionPercent: scrollPct,
            percentComplete: overallPct,
            readingTimeSeconds: 15,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.streak?.currentStreak) {
            setStreakCount(data.streak.currentStreak);
          }
        }
      } catch (err) {
        console.error('Error saving reading progress:', err);
      }
    },
    [book.id]
  );

  // Periodically save progress every 15 seconds
  useEffect(() => {
    if (!currentChapter) return;
    if (saveTimerRef.current) clearInterval(saveTimerRef.current);

    saveTimerRef.current = setInterval(() => {
      saveProgress(currentChapter.id, scrollPercent, overallPercent);
    }, 15000);

    return () => {
      if (saveTimerRef.current) clearInterval(saveTimerRef.current);
    };
  }, [currentChapter, scrollPercent, overallPercent, saveProgress]);

  // Keyboard Shortcuts (Arrow Left/Right for chapters, Esc to close panels)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'Escape') {
        setIsSettingsOpen(false);
        setIsSidebarOpen(false);
      } else if (e.key === 'ArrowRight') {
        if (currentChapterIndex < chapters.length - 1) {
          setCurrentChapterIndex((prev) => prev + 1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentChapterIndex > 0) {
          setCurrentChapterIndex((prev) => prev - 1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentChapterIndex, chapters.length]);

  // Bookmark Toggle
  const isCurrentBookmarked = bookmarks.some((b) => b.chapterId === currentChapter?.id);

  const handleToggleBookmark = async () => {
    if (!currentChapter) return;
    if (isCurrentBookmarked) {
      const bm = bookmarks.find((b) => b.chapterId === currentChapter.id);
      if (bm) {
        setBookmarks((prev) => prev.filter((b) => b.id !== bm.id));
        await fetch(`/api/reader/${book.id}/bookmarks?bookmarkId=${bm.id}`, { method: 'DELETE' });
      }
    } else {
      const res = await fetch(`/api/reader/${book.id}/bookmarks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterId: currentChapter.id,
          scrollPositionPercent: scrollPercent,
          label: `Bookmark at ${currentChapter.title}`,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setBookmarks((prev) => [data.bookmark, ...prev]);
        setToastMsg('Bookmark saved!');
        setTimeout(() => setToastMsg(null), 2500);
      }
    }
  };

  // Save Highlight
  const handleSaveHighlight = async (selectedText: string, color: HighlightingColor, note?: string) => {
    if (!currentChapter) return;
    const res = await fetch(`/api/reader/${book.id}/highlights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chapterId: currentChapter.id,
        selectedText,
        color,
        note,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setHighlights((prev) => [data.highlight, ...prev]);
      setToastMsg('Highlight & note saved!');
      setTimeout(() => setToastMsg(null), 2500);
    }
  };

  // Delete Bookmark
  const handleDeleteBookmark = async (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
    await fetch(`/api/reader/${book.id}/bookmarks?bookmarkId=${id}`, { method: 'DELETE' });
  };

  // Delete Highlight
  const handleDeleteHighlight = async (id: string) => {
    setHighlights((prev) => prev.filter((h) => h.id !== id));
    await fetch(`/api/reader/${book.id}/highlights?highlightId=${id}`, { method: 'DELETE' });
  };

  if (!currentChapter) return null;

  return (
    <div className="relative min-h-screen">
      {/* Header Bar */}
      <ReaderHeader
        bookTitle={book.title}
        chapterTitle={currentChapter.title}
        progressPercent={overallPercent}
        currentStreak={streakCount}
        isBookmarked={isCurrentBookmarked}
        onToggleBookmark={handleToggleBookmark}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleSidebar={() => setIsSidebarOpen(true)}
        onToggleAITools={() => setIsAIToolsOpen(true)}
      />

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-blue-600 text-white font-bold text-xs shadow-xl animate-scale-up flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Reader Content Area */}
      <ReaderContent
        chapterId={currentChapter.id}
        chapterTitle={currentChapter.title}
        chapterContent={currentChapter.content}
        settings={settings}
        highlights={highlights.filter((h) => h.chapterId === currentChapter.id)}
        onScrollProgress={(pct) => setScrollPercent(pct)}
        onSaveHighlight={handleSaveHighlight}
      />

      {/* Floating AI Chat Assistant Panel */}
      <AIChatPanel
        bookId={book.id}
        bookTitle={book.title}
        chapterId={currentChapter.id}
        userPlan={userPlan}
        isUnlocked={userPlan === 'PLUS' || userPlan === 'PRO'}
      />

      {/* AI Tools Modal Drawer */}
      {isAIToolsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-3xl max-h-[90vh] bg-theme-card border border-theme glass-card rounded-3xl p-6 flex flex-col shadow-2xl overflow-hidden text-theme-text space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-theme/60">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-theme-heading font-montserrat">
                    EbookVala AI Reading Suite
                  </h2>
                  <p className="text-xs text-theme-muted">
                    Chapter {currentChapter.order}: {currentChapter.title}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAIToolsOpen(false)}
                className="p-1.5 rounded-full border border-theme/60 hover:bg-slate-500/10 text-theme-muted hover:text-theme-heading transition-colors"
              >
                ✕
              </button>
            </div>

            {/* AI Tools Tabs */}
            <div className="flex flex-wrap gap-2 pb-2 border-b border-theme/40 text-xs font-bold">
              <button
                onClick={() => setActiveAITab('SUMMARY')}
                className={`px-4 py-2 rounded-2xl transition-all ${
                  activeAITab === 'SUMMARY'
                    ? 'bg-amber-500 text-white shadow-md font-extrabold'
                    : 'bg-theme-surface/60 border border-theme/60 text-theme-muted hover:text-theme-heading'
                }`}
              >
                AI Summary
              </button>
              <button
                onClick={() => setActiveAITab('FLASHCARDS')}
                className={`px-4 py-2 rounded-2xl transition-all ${
                  activeAITab === 'FLASHCARDS'
                    ? 'bg-purple-600 text-white shadow-md font-extrabold'
                    : 'bg-theme-surface/60 border border-theme/60 text-theme-muted hover:text-theme-heading'
                }`}
              >
                Flashcards
              </button>
              <button
                onClick={() => setActiveAITab('QUIZ')}
                className={`px-4 py-2 rounded-2xl transition-all ${
                  activeAITab === 'QUIZ'
                    ? 'bg-indigo-600 text-white shadow-md font-extrabold'
                    : 'bg-theme-surface/60 border border-theme/60 text-theme-muted hover:text-theme-heading'
                }`}
              >
                Quiz Generator
              </button>
              <button
                onClick={() => setActiveAITab('TRANSLATOR')}
                className={`px-4 py-2 rounded-2xl transition-all ${
                  activeAITab === 'TRANSLATOR'
                    ? 'bg-blue-600 text-white shadow-md font-extrabold'
                    : 'bg-theme-surface/60 border border-theme/60 text-theme-muted hover:text-theme-heading'
                }`}
              >
                Translator
              </button>
              <button
                onClick={() => setActiveAITab('NARRATOR')}
                className={`px-4 py-2 rounded-2xl transition-all ${
                  activeAITab === 'NARRATOR'
                    ? 'bg-amber-600 text-white shadow-md font-extrabold'
                    : 'bg-theme-surface/60 border border-theme/60 text-theme-muted hover:text-theme-heading'
                }`}
              >
                Voice Narrator
              </button>
            </div>

            {/* Active AI Tool Component */}
            <div className="flex-1 overflow-y-auto pt-2">
              {activeAITab === 'SUMMARY' && (
                <AISummaryCard
                  bookId={book.id}
                  chapterId={currentChapter.id}
                  userPlan={userPlan}
                  isUnlocked={userPlan !== 'FREE' && userPlan !== 'STARTER'}
                />
              )}

              {activeAITab === 'FLASHCARDS' && (
                <FlashcardsView
                  bookId={book.id}
                  chapterId={currentChapter.id}
                  userPlan={userPlan}
                  isUnlocked={userPlan === 'PLUS' || userPlan === 'PRO'}
                />
              )}

              {activeAITab === 'QUIZ' && (
                <QuizView
                  bookId={book.id}
                  chapterId={currentChapter.id}
                  userPlan={userPlan}
                  isUnlocked={userPlan === 'PLUS' || userPlan === 'PRO'}
                />
              )}

              {activeAITab === 'TRANSLATOR' && (
                <TranslatorPanel
                  bookId={book.id}
                  chapterId={currentChapter.id}
                  chapterText={currentChapter.content.replace(/<[^>]*>?/gm, '')}
                  userPlan={userPlan}
                  isUnlocked={userPlan === 'PLUS' || userPlan === 'PRO'}
                />
              )}

              {activeAITab === 'NARRATOR' && (
                <VoiceNarratorPlayer
                  bookId={book.id}
                  chapterId={currentChapter.id}
                  chapterText={currentChapter.content.replace(/<[^>]*>?/gm, '')}
                  userPlan={userPlan}
                  isUnlocked={userPlan === 'PRO'}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reader Settings Drawer */}
      <ReaderSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={updateSettings}
      />

      {/* Reader Sidebar Drawer (TOC, Bookmarks, Notes) */}
      <ReaderSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        chapters={chapters.map((c) => ({ id: c.id, order: c.order, title: c.title, wordCount: c.wordCount }))}
        bookmarks={bookmarks}
        highlights={highlights}
        currentChapterId={currentChapter.id}
        onSelectChapter={(chapId) => {
          const idx = chapters.findIndex((c) => c.id === chapId);
          if (idx !== -1) {
            setCurrentChapterIndex(idx);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        onSelectBookmark={(bm) => {
          const idx = chapters.findIndex((c) => c.id === bm.chapterId);
          if (idx !== -1) {
            setCurrentChapterIndex(idx);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        onSelectHighlight={(hl) => {
          const idx = chapters.findIndex((c) => c.id === hl.chapterId);
          if (idx !== -1) {
            setCurrentChapterIndex(idx);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        onDeleteBookmark={handleDeleteBookmark}
        onDeleteHighlight={handleDeleteHighlight}
      />

      {/* Bottom Reader Progress Bar */}
      <ReaderProgressBar
        currentChapterOrder={currentChapter.order}
        totalChapters={chapters.length}
        progressPercent={overallPercent}
        hasPrevious={currentChapterIndex > 0}
        hasNext={currentChapterIndex < chapters.length - 1}
        onPrevious={() => {
          if (currentChapterIndex > 0) {
            setCurrentChapterIndex((prev) => prev - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        onNext={() => {
          if (currentChapterIndex < chapters.length - 1) {
            setCurrentChapterIndex((prev) => prev + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
      />
    </div>
  );
}
