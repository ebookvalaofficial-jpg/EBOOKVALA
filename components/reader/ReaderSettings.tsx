'use client';

import React from 'react';
import ReaderThemeToggle, { ReaderTheme } from './ReaderThemeToggle';
import { X, Type, AlignLeft, Maximize2, Palette } from 'lucide-react';

export type FontSize = 'small' | 'medium' | 'large' | 'xlarge';
export type FontFamily = 'sans' | 'serif' | 'dyslexic';
export type LineHeight = 'compact' | 'comfortable' | 'relaxed';
export type MarginWidth = 'narrow' | 'medium' | 'wide';

export interface ReaderSettingsState {
  fontSize: FontSize;
  fontFamily: FontFamily;
  lineHeight: LineHeight;
  marginWidth: MarginWidth;
  theme: ReaderTheme;
}

interface ReaderSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ReaderSettingsState;
  onUpdateSettings: (newSettings: Partial<ReaderSettingsState>) => void;
}

export default function ReaderSettings({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}: ReaderSettingsProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-xs animate-fade-in" data-lenis-prevent>
      <div className="w-full max-w-sm h-full bg-theme-card border-l border-theme p-6 overflow-y-auto space-y-6 shadow-2xl glass-card text-theme-text">
        {/* Settings Header */}
        <div className="flex items-center justify-between pb-4 border-b border-theme/60">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary-blue" />
            <h3 className="text-base font-bold text-theme-heading font-montserrat">Reader Customization</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-theme-muted hover:text-theme-heading hover:bg-slate-500/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Theme Selection */}
        <div className="space-y-2">
          <label className="text-xs font-extrabold uppercase tracking-wider text-theme-muted block">Reading Theme</label>
          <ReaderThemeToggle
            currentTheme={settings.theme}
            onThemeChange={(theme) => onUpdateSettings({ theme })}
          />
        </div>

        {/* 2. Font Size */}
        <div className="space-y-2">
          <label className="text-xs font-extrabold uppercase tracking-wider text-theme-muted block">Font Size</label>
          <div className="grid grid-cols-4 gap-2">
            {(['small', 'medium', 'large', 'xlarge'] as FontSize[]).map((size) => (
              <button
                key={size}
                onClick={() => onUpdateSettings({ fontSize: size })}
                className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                  settings.fontSize === size
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'bg-theme-surface border-theme text-theme-heading hover:bg-slate-500/10'
                }`}
              >
                {size === 'small' ? 'A-' : size === 'medium' ? 'A' : size === 'large' ? 'A+' : 'A++'}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Font Family */}
        <div className="space-y-2">
          <label className="text-xs font-extrabold uppercase tracking-wider text-theme-muted block">Typography</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'sans', label: 'Sans-Serif', class: 'font-sans' },
              { id: 'serif', label: 'Merriweather', class: 'font-merriweather font-serif' },
              { id: 'dyslexic', label: 'Clean Mono', class: 'font-mono' },
            ].map((font) => (
              <button
                key={font.id}
                onClick={() => onUpdateSettings({ fontFamily: font.id as FontFamily })}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${font.class} ${
                  settings.fontFamily === font.id
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'bg-theme-surface border-theme text-theme-heading hover:bg-slate-500/10'
                }`}
              >
                {font.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Line Spacing */}
        <div className="space-y-2">
          <label className="text-xs font-extrabold uppercase tracking-wider text-theme-muted block">Line Height</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'compact', label: 'Compact (1.4)' },
              { id: 'comfortable', label: 'Normal (1.75)' },
              { id: 'relaxed', label: 'Relaxed (2.1)' },
            ].map((lh) => (
              <button
                key={lh.id}
                onClick={() => onUpdateSettings({ lineHeight: lh.id as LineHeight })}
                className={`py-2 text-[11px] font-bold rounded-xl border transition-all ${
                  settings.lineHeight === lh.id
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'bg-theme-surface border-theme text-theme-heading hover:bg-slate-500/10'
                }`}
              >
                {lh.label}
              </button>
            ))}
          </div>
        </div>

        {/* 5. Margin Width */}
        <div className="space-y-2">
          <label className="text-xs font-extrabold uppercase tracking-wider text-theme-muted block">Content Width</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'narrow', label: 'Narrow' },
              { id: 'medium', label: 'Standard' },
              { id: 'wide', label: 'Wide' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => onUpdateSettings({ marginWidth: m.id as MarginWidth })}
                className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                  settings.marginWidth === m.id
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'bg-theme-surface border-theme text-theme-heading hover:bg-slate-500/10'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl text-xs font-bold text-white brand-gradient-bg shadow-md mt-4"
        >
          Done
        </button>
      </div>
    </div>
  );
}
