'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MessageSquare, Send, RefreshCw } from 'lucide-react';

interface BookItem {
  id: string;
  title: string;
}

interface CategoryItem {
  id: string;
  name: string;
}

function NewDiscussionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultBookId = searchParams.get('bookId') || '';

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [bookId, setBookId] = useState(defaultBookId);
  const [categoryId, setCategoryId] = useState('');

  const [books, setBooks] = useState<BookItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [booksRes, catsRes] = await Promise.all([
          fetch('/api/books?limit=100'),
          fetch('/api/admin/categories'),
        ]);

        if (booksRes.ok) {
          const bData = await booksRes.json();
          setBooks(bData.books || []);
        }

        if (catsRes.ok) {
          const cData = await catsRes.json();
          setCategories(cData.categories || []);
        }
      } catch (err) {
        console.error('Error loading form options:', err);
      }
    };

    fetchOptions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/community/discussions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          body,
          bookId: bookId || undefined,
          categoryId: categoryId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create discussion');
        return;
      }

      router.push(`/community/discussions/${data.discussion.id}`);
    } catch (err: any) {
      setError('Network error creating discussion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-theme-card border border-theme glass-card space-y-6 shadow-xl">
      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-theme-heading">Discussion Title *</label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. What were your thoughts on the ending of Chapter 4?"
          className="w-full px-4 py-2.5 rounded-2xl bg-theme-surface border border-theme/60 text-xs font-semibold text-theme-heading focus:outline-none focus:border-amber-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-theme-heading">Attach to Book (Optional)</label>
          <select
            value={bookId}
            onChange={(e) => setBookId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl bg-theme-surface border border-theme/60 text-xs font-semibold text-theme-heading focus:outline-none focus:border-amber-500"
          >
            <option value="">-- General / No Specific Book --</option>
            {books.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-theme-heading">Category (Optional)</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl bg-theme-surface border border-theme/60 text-xs font-semibold text-theme-heading focus:outline-none focus:border-amber-500"
          >
            <option value="">-- All Categories --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-theme-heading">Discussion Body (Min 10 characters) *</label>
        <textarea
          required
          rows={6}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Elaborate on your topic or post your questions..."
          className="w-full px-4 py-3 rounded-2xl bg-theme-surface border border-theme/60 text-xs font-semibold text-theme-heading focus:outline-none focus:border-amber-500 font-sans"
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading || !title.trim() || !body.trim()}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white text-xs font-extrabold uppercase tracking-wide shadow-xl disabled:opacity-40 transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          <span>Publish Discussion Thread</span>
        </button>
      </div>
    </form>
  );
}

export default function NewDiscussionPage() {
  return (
    <main className="min-h-screen bg-theme-bg py-8 px-4 sm:px-6 font-inter text-theme-text">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-theme-heading font-montserrat">Start a New Discussion</h1>
          <p className="text-xs text-theme-muted">Share your thoughts, ask questions, or review topics with the EbookVala community.</p>
        </div>

        <Suspense fallback={<div className="p-8 text-center text-xs text-theme-muted">Loading form...</div>}>
          <NewDiscussionForm />
        </Suspense>
      </div>
    </main>
  );
}
