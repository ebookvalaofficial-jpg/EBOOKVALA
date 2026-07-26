'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Highlighter, Trash2, ArrowUpRight, BookOpen, MessageSquare } from 'lucide-react';

export interface NoteItem {
  id: string;
  bookId: string;
  bookTitle: string;
  coverImageUrl: string;
  chapterTitle: string;
  selectedText: string;
  color: string;
  note?: string | null;
  createdAt: string;
}

interface NotesListProps {
  initialNotes: NoteItem[];
}

const colorPillMap: Record<string, string> = {
  YELLOW: 'bg-amber-400',
  GREEN: 'bg-emerald-400',
  BLUE: 'bg-sky-400',
  PINK: 'bg-rose-400',
};

export default function NotesList({ initialNotes }: NotesListProps) {
  const [notes, setNotes] = useState<NoteItem[]>(initialNotes);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState('all');

  const books = useMemo(() => {
    const set = new Set<string>();
    notes.forEach((n) => set.add(n.bookTitle));
    return Array.from(set);
  }, [notes]);

  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      const matchesSearch =
        n.selectedText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (n.note && n.note.toLowerCase().includes(searchQuery.toLowerCase())) ||
        n.bookTitle.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBook = selectedBook === 'all' || n.bookTitle === selectedBook;
      return matchesSearch && matchesBook;
    });
  }, [notes, searchQuery, selectedBook]);

  const handleDelete = async (id: string, bookId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    try {
      await fetch(`/api/reader/${bookId}/highlights?highlightId=${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error('Error deleting highlight:', e);
    }
  };

  return (
    <div className="space-y-6 text-theme-text">
      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-3xl bg-theme-card border border-theme glass-card">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes & highlighted passages..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-theme-surface border border-theme/60 text-xs font-semibold text-theme-heading placeholder:text-theme-muted focus:outline-none focus:border-blue-500"
          />
        </div>

        <select
          value={selectedBook}
          onChange={(e) => setSelectedBook(e.target.value)}
          className="w-full sm:w-auto px-4 py-2 rounded-2xl bg-theme-surface border border-theme/60 text-xs font-bold text-theme-heading focus:outline-none"
        >
          <option value="all">All Books</option>
          {books.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      {/* Notes Aggregated List */}
      {filteredNotes.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-theme-card border border-theme glass-card space-y-3">
          <Highlighter className="w-12 h-12 text-theme-muted mx-auto" />
          <h3 className="text-base font-bold text-theme-heading">No highlights or notes found</h3>
          <p className="text-xs text-theme-muted">Select text in any eBook while reading to highlight & annotate.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotes.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-3xl bg-theme-card border border-theme glass-card hover:border-blue-500/40 transition-all space-y-3 shadow-xs"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative w-8 h-11 rounded-lg overflow-hidden shrink-0 shadow-xs">
                    <Image src={item.coverImageUrl} alt={item.bookTitle} fill className="object-cover" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-theme-heading font-montserrat">{item.bookTitle}</h4>
                    <span className="text-[10px] text-theme-muted">{item.chapterTitle}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${colorPillMap[item.color] || 'bg-amber-400'}`} />
                  <Link
                    href={`/reader/${item.bookId}`}
                    className="p-1.5 rounded-xl bg-theme-surface border border-theme/60 text-theme-heading hover:bg-slate-500/10 flex items-center gap-1 text-xs font-bold transition-colors"
                  >
                    <span>Jump to Reader</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-primary-blue" />
                  </Link>
                  <button
                    onClick={() => handleDelete(item.id, item.bookId)}
                    className="p-1.5 rounded-xl text-theme-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Highlight Passage */}
              <div className="p-3.5 rounded-2xl bg-theme-surface border border-theme/40 text-xs text-theme-heading italic font-serif">
                &ldquo;{item.selectedText}&rdquo;
              </div>

              {/* Personal Note if exists */}
              {item.note && (
                <div className="flex items-start gap-2 p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-primary-blue">
                  <MessageSquare className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-extrabold uppercase block text-blue-400">Personal Note</span>
                    <p className="text-theme-heading mt-0.5">{item.note}</p>
                  </div>
                </div>
              )}

              <span className="text-[10px] text-theme-muted block text-right font-medium">
                Saved {new Date(item.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
