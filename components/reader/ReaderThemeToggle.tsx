'use client';

import React from 'react';
import { Sun, Moon, Sparkles, Flame } from 'lucide-react';

export type ReaderTheme = 'light' | 'sepia' | 'dark' | 'oled';

interface ReaderThemeToggleProps {
  currentTheme: ReaderTheme;
  onThemeChange: (theme: ReaderTheme) => void;
}

const themes: Array<{ id: ReaderTheme; label: string; bg: string; text: string; border: string }> = [
  { id: 'light', label: 'Light', bg: 'bg-[#F9FAFB]', text: 'text-[#1F2937]', border: 'border-slate-300' },
  { id: 'sepia', label: 'Sepia', bg: 'bg-[#FBF0D9]', text: 'text-[#433422]', border: 'border-[#E6D7B8]' },
  { id: 'dark', label: 'Dark', bg: 'bg-[#111827]', text: 'text-[#E5E7EB]', border: 'border-slate-700' },
  { id: 'oled', label: 'OLED Black', bg: 'bg-[#000000]', text: 'text-[#F3F4F6]', border: 'border-neutral-800' },
];

export default function ReaderThemeToggle({ currentTheme, onThemeChange }: ReaderThemeToggleProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {themes.map((t) => {
        const isSelected = currentTheme === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onThemeChange(t.id)}
            className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${t.bg} ${t.text} ${
              isSelected ? 'ring-2 ring-blue-500 scale-[1.02] shadow-md' : 'opacity-80 hover:opacity-100'
            }`}
          >
            <span>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
