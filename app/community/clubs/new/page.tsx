'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Send, RefreshCw } from 'lucide-react';

interface BookItem {
  id: string;
  title: string;
}

export default function NewReadingClubPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [currentBookId, setCurrentBookId] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [memberLimit, setMemberLimit] = useState<number | ''>('');

  const [books, setBooks] = useState<BookItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch('/api/books?limit=100');
        if (res.ok) {
          const data = await res.json();
          setBooks(data.books || []);
        }
      } catch (err) {
        console.error('Error fetching books list:', err);
      }
    };
    fetchBooks();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/community/clubs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          coverImageUrl: coverImageUrl || undefined,
          currentBookId: currentBookId || undefined,
          isPublic,
          memberLimit: memberLimit ? Number(memberLimit) : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create reading club');
        return;
      }

      router.push(`/community/clubs/${data.club.id}`);
    } catch (err: any) {
      setError('Network error creating reading club');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-theme-bg py-8 px-4 sm:px-6 font-inter text-theme-text">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-theme-heading font-montserrat">Create a Reading Club</h1>
          <p className="text-xs text-theme-muted">Gather fellow bibliophiles, pick monthly books, and host structured discussions.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-theme-card border border-theme glass-card space-y-6 shadow-xl">
          {error && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-theme-heading">Club Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Non-Fiction Innovators Guild"
              className="w-full px-4 py-2.5 rounded-2xl bg-theme-surface border border-theme/60 text-xs font-semibold text-theme-heading focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-theme-heading">Description (Min 10 characters) *</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What kind of books will your club read and discuss?"
              className="w-full px-4 py-2.5 rounded-2xl bg-theme-surface border border-theme/60 text-xs font-semibold text-theme-heading focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-theme-heading">Initial Featured Book (Optional)</label>
              <select
                value={currentBookId}
                onChange={(e) => setCurrentBookId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-theme-surface border border-theme/60 text-xs font-semibold text-theme-heading focus:outline-none focus:border-amber-500"
              >
                <option value="">-- No Book Selected Yet --</option>
                {books.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-theme-heading">Member Limit (Optional)</label>
              <input
                type="number"
                min={2}
                value={memberLimit}
                onChange={(e) => setMemberLimit(e.target.value ? Number(e.target.value) : '')}
                placeholder="e.g. 20 (Leave blank for unlimited)"
                className="w-full px-4 py-2.5 rounded-2xl bg-theme-surface border border-theme/60 text-xs font-semibold text-theme-heading focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-theme-heading">Cover Image URL (Optional)</label>
            <input
              type="text"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full px-4 py-2.5 rounded-2xl bg-theme-surface border border-theme/60 text-xs font-semibold text-theme-heading focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="isPublicCheck"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
            />
            <label htmlFor="isPublicCheck" className="text-xs font-bold text-theme-heading cursor-pointer">
              Public Club (Anyone can discover and join directly)
            </label>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || !name.trim() || !description.trim()}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white text-xs font-extrabold uppercase tracking-wide shadow-xl disabled:opacity-40 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Create Reading Club</span>
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
