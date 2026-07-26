'use client';

import React, { useState } from 'react';
import { HighlightingColor } from './ReaderContent';
import { Sparkles, Check, X, MessageSquare } from 'lucide-react';

interface HighlightPopoverProps {
  position: { top: number; left: number } | null;
  selectedText: string;
  onSave: (color: HighlightingColor, note?: string) => void;
  onClose: () => void;
}

const colorMap: Record<HighlightingColor, { bg: string; border: string; label: string }> = {
  YELLOW: { bg: 'bg-amber-400', border: 'border-amber-500', label: 'Yellow' },
  GREEN: { bg: 'bg-emerald-400', border: 'border-emerald-500', label: 'Green' },
  BLUE: { bg: 'bg-sky-400', border: 'border-sky-500', label: 'Blue' },
  PINK: { bg: 'bg-rose-400', border: 'border-rose-500', label: 'Pink' },
};

export default function HighlightPopover({
  position,
  selectedText,
  onSave,
  onClose,
}: HighlightPopoverProps) {
  const [selectedColor, setSelectedColor] = useState<HighlightingColor>('YELLOW');
  const [note, setNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);

  if (!position) return null;

  return (
    <div
      className="fixed z-50 transform -translate-x-1/2 -translate-y-full mb-3 w-80 p-4 rounded-2xl bg-theme-card border border-theme glass-card shadow-2xl space-y-3 animate-scale-up text-theme-text"
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
      data-lenis-prevent
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-theme-muted">
          Highlight Text
        </span>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-theme-muted hover:text-theme-heading hover:bg-slate-500/10"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <p className="text-xs text-theme-heading italic line-clamp-2 bg-theme-surface p-2 rounded-xl border border-theme/40">
        &ldquo;{selectedText}&rdquo;
      </p>

      {/* Color Picker */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {(['YELLOW', 'GREEN', 'BLUE', 'PINK'] as HighlightingColor[]).map((c) => (
            <button
              key={c}
              onClick={() => setSelectedColor(c)}
              className={`w-7 h-7 rounded-full ${colorMap[c].bg} ${colorMap[c].border} border-2 flex items-center justify-center transition-transform ${
                selectedColor === c ? 'scale-125 shadow-md ring-2 ring-blue-500' : 'hover:scale-110'
              }`}
            >
              {selectedColor === c && <Check className="w-3.5 h-3.5 text-slate-950 font-bold" />}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowNoteInput(!showNoteInput)}
          className={`p-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-colors ${
            showNoteInput ? 'bg-blue-600 text-white border-blue-600' : 'bg-theme-surface border-theme/60 text-theme-heading'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Note</span>
        </button>
      </div>

      {/* Optional Note Textarea */}
      {showNoteInput && (
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a personal note or insight..."
          rows={2}
          className="w-full p-2.5 rounded-xl bg-theme-surface border border-theme text-xs font-medium text-theme-heading placeholder:text-theme-muted focus:outline-none focus:border-blue-500"
        />
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => onSave(selectedColor, note.trim() || undefined)}
          className="flex-1 py-2 rounded-xl text-xs font-bold text-white brand-gradient-bg shadow-md"
        >
          Save Highlight
        </button>
        <button
          onClick={onClose}
          className="px-3 py-2 rounded-xl text-xs font-bold bg-theme-surface border border-theme text-theme-muted hover:text-theme-heading"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
