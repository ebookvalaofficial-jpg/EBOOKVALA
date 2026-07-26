'use client';

import React, { useRef, useEffect, useState } from 'react';
import { ReaderSettingsState } from './ReaderSettings';
import HighlightPopover from './HighlightPopover';

export type HighlightingColor = 'YELLOW' | 'GREEN' | 'BLUE' | 'PINK';

export interface ChapterHighlightData {
  id: string;
  selectedText: string;
  color: HighlightingColor;
  note?: string | null;
}

interface ReaderContentProps {
  chapterId: string;
  chapterTitle: string;
  chapterContent: string;
  settings: ReaderSettingsState;
  highlights: ChapterHighlightData[];
  onScrollProgress: (scrollPercent: number) => void;
  onSaveHighlight: (selectedText: string, color: HighlightingColor, note?: string) => void;
}

// Reader-Specific Theme Color Schemes
const themeStyles: Record<
  ReaderSettingsState['theme'],
  { container: string; text: string; bg: string }
> = {
  light: {
    container: 'bg-[#F9FAFB] text-[#1F2937]',
    text: 'text-[#1F2937]',
    bg: '#F9FAFB',
  },
  sepia: {
    container: 'bg-[#FBF0D9] text-[#433422]',
    text: 'text-[#433422]',
    bg: '#FBF0D9',
  },
  dark: {
    container: 'bg-[#111827] text-[#E5E7EB]',
    text: 'text-[#E5E7EB]',
    bg: '#111827',
  },
  oled: {
    container: 'bg-[#000000] text-[#F3F4F6]',
    text: 'text-[#F3F4F6]',
    bg: '#000000',
  },
};

const fontSizeClasses: Record<ReaderSettingsState['fontSize'], string> = {
  small: 'text-sm sm:text-base',
  medium: 'text-base sm:text-lg',
  large: 'text-lg sm:text-xl',
  xlarge: 'text-xl sm:text-2xl',
};

const fontFamilyClasses: Record<ReaderSettingsState['fontFamily'], string> = {
  sans: 'font-sans',
  serif: 'font-merriweather font-serif',
  dyslexic: 'font-mono tracking-wide',
};

const lineHeightClasses: Record<ReaderSettingsState['lineHeight'], string> = {
  compact: 'leading-snug space-y-4',
  comfortable: 'leading-relaxed space-y-6',
  relaxed: 'leading-loose space-y-8',
};

const marginWidthClasses: Record<ReaderSettingsState['marginWidth'], string> = {
  narrow: 'max-w-xl',
  medium: 'max-w-3xl',
  wide: 'max-w-5xl',
};

const highlightBgMap: Record<HighlightingColor, string> = {
  YELLOW: 'bg-amber-300/40 dark:bg-amber-500/30 text-amber-950 dark:text-amber-100 rounded-xs px-1',
  GREEN: 'bg-emerald-300/40 dark:bg-emerald-500/30 text-emerald-950 dark:text-emerald-100 rounded-xs px-1',
  BLUE: 'bg-sky-300/40 dark:bg-sky-500/30 text-sky-950 dark:text-sky-100 rounded-xs px-1',
  PINK: 'bg-rose-300/40 dark:bg-rose-500/30 text-rose-950 dark:text-rose-100 rounded-xs px-1',
};

export default function ReaderContent({
  chapterId,
  chapterTitle,
  chapterContent,
  settings,
  highlights,
  onScrollProgress,
  onSaveHighlight,
}: ReaderContentProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [popoverState, setPopoverState] = useState<{
    position: { top: number; left: number };
    selectedText: string;
  } | null>(null);

  // Monitor scroll position within chapter content
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const el = document.documentElement;
      const totalScroll = el.scrollHeight - el.clientHeight;
      if (totalScroll <= 0) {
        onScrollProgress(100);
        return;
      }
      const currentScroll = el.scrollTop;
      const percent = Math.min(100, Math.max(0, (currentScroll / totalScroll) * 100));
      onScrollProgress(percent);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [onScrollProgress]);

  // Handle text selection for HighlightPopover
  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      return;
    }
    const text = selection.toString().trim();
    if (text.length < 3) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    setPopoverState({
      position: {
        top: rect.top + window.scrollY,
        left: rect.left + rect.width / 2 + window.scrollX,
      },
      selectedText: text,
    });
  };

  const themeConfig = themeStyles[settings.theme] || themeStyles.light;

  return (
    <div className={`min-h-screen py-24 px-4 sm:px-6 transition-colors duration-300 ${themeConfig.container}`}>
      <article
        ref={containerRef}
        onMouseUp={handleMouseUp}
        className={`mx-auto ${marginWidthClasses[settings.marginWidth]} ${fontFamilyClasses[settings.fontFamily]} ${fontSizeClasses[settings.fontSize]} ${lineHeightClasses[settings.lineHeight]}`}
      >
        <header className="pb-8 mb-8 border-b border-current/10">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-montserrat">{chapterTitle}</h1>
        </header>

        {/* Chapter Prose Content */}
        <div
          className="reader-prose prose prose-slate max-w-none"
          dangerouslySetInnerHTML={{ __html: chapterContent }}
        />
      </article>

      {/* Text Selection Highlight Popover */}
      {popoverState && (
        <HighlightPopover
          position={popoverState.position}
          selectedText={popoverState.selectedText}
          onSave={(color, note) => {
            onSaveHighlight(popoverState.selectedText, color, note);
            setPopoverState(null);
            window.getSelection()?.removeAllRanges();
          }}
          onClose={() => setPopoverState(null)}
        />
      )}
    </div>
  );
}
