'use client';

import React, { useEffect, useState } from 'react';
import {
  Highlighter, Bookmark, StickyNote as StickyIcon, Download, Plus, Eye, EyeOff, Trash2, Loader2, Sparkles, FileText, Check
} from 'lucide-react';

interface HighlightItem {
  id: string;
  selectedText: string;
  note?: string | null;
  color: string;
  isPublic: boolean;
  createdAt: string;
  book: { title: string };
  chapter: { title: string };
}

interface BookmarkItem {
  id: string;
  scrollPositionPercent: number;
  label?: string | null;
  createdAt: string;
  book: { title: string };
  chapter: { title: string };
}

interface StickyNoteItem {
  id: string;
  title: string;
  content: string;
  color: string;
  createdAt: string;
  book?: { title: string } | null;
}

export default function NotesWorkspacePage() {
  const [activeTab, setActiveTab] = useState<'highlights' | 'bookmarks' | 'sticky'>('highlights');
  const [loading, setLoading] = useState(true);

  const [highlights, setHighlights] = useState<HighlightItem[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [stickyNotes, setStickyNotes] = useState<StickyNoteItem[]>([]);

  // Create Sticky Note Modal
  const [showStickyModal, setShowStickyModal] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteColor, setNoteColor] = useState('YELLOW');
  const [savingNote, setSavingNote] = useState(false);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard/notes');
      if (res.ok) {
        const json = await res.json();
        setHighlights(json.highlights || []);
        setBookmarks(json.bookmarks || []);
        setStickyNotes(json.stickyNotes || []);
      }
    } catch (err) {
      console.error('Fetch notes error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleToggleHighlightPublic = async (highlightId: string, currentPublic: boolean) => {
    try {
      const res = await fetch('/api/dashboard/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'toggle-public-highlight',
          highlightId,
          isPublic: !currentPublic,
        }),
      });
      if (res.ok) await fetchNotes();
    } catch (err) {
      console.error('Toggle highlight error:', err);
    }
  };

  const handleCreateStickyNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    try {
      setSavingNote(true);
      const res = await fetch('/api/dashboard/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'create-sticky',
          title: noteTitle.trim() || 'Sticky Note',
          content: noteContent.trim(),
          color: noteColor,
        }),
      });
      if (res.ok) {
        setNoteTitle('');
        setNoteContent('');
        setShowStickyModal(false);
        await fetchNotes();
      }
    } catch (err) {
      console.error('Create sticky note error:', err);
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeleteStickyNote = async (noteId: string) => {
    try {
      const res = await fetch('/api/dashboard/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'delete-sticky',
          noteId,
        }),
      });
      if (res.ok) await fetchNotes();
    } catch (err) {
      console.error('Delete sticky note error:', err);
    }
  };

  const getStickyBg = (color: string) => {
    switch (color) {
      case 'BLUE': return 'bg-blue-500/10 border-blue-500/30 text-blue-200';
      case 'GREEN': return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200';
      case 'PINK': return 'bg-rose-500/10 border-rose-500/30 text-rose-200';
      case 'PURPLE': return 'bg-purple-500/10 border-purple-500/30 text-purple-200';
      default: return 'bg-amber-500/10 border-amber-500/30 text-amber-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner & Export Dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-theme-card border border-theme glass-card">
        <div>
          <h1 className="text-2xl font-extrabold text-theme-heading font-montserrat flex items-center gap-2">
            <Highlighter className="w-6 h-6 text-primary-blue" /> Personal Notes & Highlights Workspace
          </h1>
          <p className="text-xs text-theme-muted mt-1">
            Manage your annotated quotes, chapter bookmarks, and freeform sticky notes. Export anytime to Markdown, PDF, or DOCX.
          </p>
        </div>

        {/* Real File Export Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href="/api/dashboard/notes/export?format=md"
            download
            className="px-3 py-2 rounded-xl bg-slate-800 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Markdown (.md)
          </a>

          <a
            href="/api/dashboard/notes/export?format=pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 rounded-xl bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" /> PDF Document
          </a>

          <a
            href="/api/dashboard/notes/export?format=docx"
            download
            className="px-3 py-2 rounded-xl bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 border border-purple-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Word (.doc)
          </a>
        </div>
      </div>

      {/* Tabs & New Sticky Button */}
      <div className="flex items-center justify-between gap-4 border-b border-theme/60 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('highlights')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'highlights'
                ? 'bg-primary-blue text-white shadow-md'
                : 'bg-theme-card text-theme-muted hover:text-theme-heading border border-theme'
            }`}
          >
            <Highlighter className="w-3.5 h-3.5" /> Highlights ({highlights.length})
          </button>

          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'bookmarks'
                ? 'bg-primary-blue text-white shadow-md'
                : 'bg-theme-card text-theme-muted hover:text-theme-heading border border-theme'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" /> Bookmarks ({bookmarks.length})
          </button>

          <button
            onClick={() => setActiveTab('sticky')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'sticky'
                ? 'bg-primary-blue text-white shadow-md'
                : 'bg-theme-card text-theme-muted hover:text-theme-heading border border-theme'
            }`}
          >
            <StickyIcon className="w-3.5 h-3.5" /> Sticky Notes ({stickyNotes.length})
          </button>
        </div>

        {activeTab === 'sticky' && (
          <button
            onClick={() => setShowStickyModal(true)}
            className="px-4 py-2 rounded-2xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition-all flex items-center gap-1.5 shadow-md"
          >
            <Plus className="w-4 h-4" /> Create Sticky Note
          </button>
        )}
      </div>

      {/* Content Panels */}
      {loading ? (
        <div className="py-16 flex justify-center items-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-blue" />
        </div>
      ) : activeTab === 'highlights' ? (
        /* Highlights List */
        highlights.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-theme-card border border-theme glass-card space-y-2">
            <Highlighter className="w-10 h-10 text-theme-muted mx-auto opacity-40" />
            <h3 className="text-sm font-bold text-theme-heading">No highlights created yet</h3>
            <p className="text-xs text-theme-muted">Select text inside the eBook reader to add highlights and notes!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {highlights.map((h) => (
              <div key={h.id} className="p-5 rounded-3xl bg-theme-card border border-theme glass-card space-y-3 shadow-sm hover:border-blue-500/40 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-primary-blue">
                    {h.book.title} — <span className="text-theme-muted">{h.chapter.title}</span>
                  </span>

                  <button
                    onClick={() => handleToggleHighlightPublic(h.id, h.isPublic)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all flex items-center gap-1 ${
                      h.isPublic
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {h.isPublic ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    <span>{h.isPublic ? 'Public Note' : 'Private'}</span>
                  </button>
                </div>

                <blockquote className="p-3.5 rounded-2xl bg-theme-surface border-l-4 border-blue-500 text-xs text-theme-heading italic font-serif leading-relaxed">
                  &quot;{h.selectedText}&quot;
                </blockquote>

                {h.note && (
                  <p className="text-xs text-theme-muted font-medium bg-slate-800/40 p-3 rounded-xl border border-theme">
                    <strong className="text-theme-heading">My Note:</strong> {h.note}
                  </p>
                )}

                <div className="flex items-center justify-between text-[10px] text-theme-muted">
                  <span>Color: {h.color}</span>
                  <span>{new Date(h.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )
      ) : activeTab === 'bookmarks' ? (
        /* Bookmarks List */
        bookmarks.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-theme-card border border-theme glass-card space-y-2">
            <Bookmark className="w-10 h-10 text-theme-muted mx-auto opacity-40" />
            <h3 className="text-sm font-bold text-theme-heading">No bookmarks saved yet</h3>
            <p className="text-xs text-theme-muted">Bookmark key chapters while reading in the eBook reader!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bookmarks.map((b) => (
              <div key={b.id} className="p-4 rounded-3xl bg-theme-card border border-theme glass-card space-y-2 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-extrabold text-theme-heading font-montserrat">{b.book.title}</h4>
                  <p className="text-xs text-theme-muted">{b.chapter.title}</p>
                  <span className="text-[10px] font-bold text-primary-blue block mt-1">
                    {b.scrollPositionPercent.toFixed(0)}% Read Position
                  </span>
                </div>
                <Bookmark className="w-6 h-6 text-amber-400 fill-amber-400 shrink-0" />
              </div>
            ))}
          </div>
        )
      ) : (
        /* Sticky Notes Freeform Grid */
        stickyNotes.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-theme-card border border-theme glass-card space-y-3">
            <StickyIcon className="w-12 h-12 text-amber-400 mx-auto opacity-60" />
            <h3 className="text-base font-extrabold text-theme-heading font-montserrat">No Sticky Notes Created</h3>
            <p className="text-xs text-theme-muted max-w-sm mx-auto">
              Create freeform sticky notes for reading goals, book reflections, ideas, or study checklists!
            </p>
            <button
              onClick={() => setShowStickyModal(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition-colors inline-flex items-center gap-2 mt-2"
            >
              <Plus className="w-4 h-4" /> Create First Sticky Note
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {stickyNotes.map((note) => (
              <div key={note.id} className={`p-5 rounded-3xl border ${getStickyBg(note.color)} glass-card space-y-3 flex flex-col justify-between shadow-md`}>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-black font-montserrat">{note.title}</h3>
                    <button
                      onClick={() => handleDeleteStickyNote(note.id)}
                      className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Delete Note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs leading-relaxed whitespace-pre-wrap">{note.content}</p>
                </div>
                <div className="text-[10px] opacity-70 font-semibold pt-2 border-t border-white/10">
                  {new Date(note.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Modal: Create Sticky Note */}
      {showStickyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md p-6 rounded-3xl bg-theme-card border border-theme glass-card shadow-2xl space-y-4">
            <h3 className="text-lg font-extrabold text-theme-heading font-montserrat flex items-center gap-2">
              <StickyIcon className="w-5 h-5 text-amber-400" /> Create Freeform Sticky Note
            </h3>
            <form onSubmit={handleCreateStickyNote} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-theme-heading uppercase tracking-wider mb-1">
                  Note Title
                </label>
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="e.g. Chapter 4 Key Takeaways"
                  className="w-full px-4 py-2.5 bg-theme-surface border border-theme rounded-xl text-sm text-theme-heading focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-theme-heading uppercase tracking-wider mb-1">
                  Note Content
                </label>
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  rows={4}
                  placeholder="Write your thoughts, key quotes, or reading ideas here..."
                  className="w-full px-4 py-2.5 bg-theme-surface border border-theme rounded-xl text-sm text-theme-heading focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-theme-heading uppercase tracking-wider mb-2">
                  Card Color
                </label>
                <div className="flex items-center gap-3">
                  {[
                    { color: 'YELLOW', bg: 'bg-amber-500' },
                    { color: 'BLUE', bg: 'bg-blue-500' },
                    { color: 'GREEN', bg: 'bg-emerald-500' },
                    { color: 'PINK', bg: 'bg-rose-500' },
                    { color: 'PURPLE', bg: 'bg-purple-500' },
                  ].map((c) => (
                    <button
                      key={c.color}
                      type="button"
                      onClick={() => setNoteColor(c.color)}
                      className={`w-7 h-7 rounded-full ${c.bg} flex items-center justify-center transition-transform ${
                        noteColor === c.color ? 'scale-125 ring-2 ring-white' : 'opacity-70'
                      }`}
                    >
                      {noteColor === c.color && <Check className="w-4 h-4 text-white stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStickyModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-theme-muted hover:text-theme-heading"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingNote}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition-all shadow-md flex items-center gap-2"
                >
                  {savingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Sticky Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
