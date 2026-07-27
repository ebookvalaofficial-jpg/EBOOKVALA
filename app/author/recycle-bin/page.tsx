'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, RotateCcw, AlertTriangle, ArrowLeft, Loader2, BookOpen, ShieldAlert } from 'lucide-react';
import AuthorSidebar from '@/components/author/AuthorSidebar';

interface RecycleBinItem {
  id: string;
  title: string;
  coverImageUrl?: string;
  category?: { name: string };
  price: number;
  deletedAt: string;
}

export default function AuthorRecycleBinPage() {
  const [items, setItems] = useState<RecycleBinItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchRecycleBin = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/author/books/any/trash');
      if (res.ok) {
        const json = await res.json();
        const combined: RecycleBinItem[] = [];
        if (json.deletedSubmissions) {
          json.deletedSubmissions.forEach((s: any) => {
            combined.push({
              id: s.id,
              title: s.title,
              coverImageUrl: s.coverImageUrl,
              category: s.category,
              price: s.price,
              deletedAt: s.deletedAt,
            });
          });
        }
        if (json.deletedBooks) {
          json.deletedBooks.forEach((b: any) => {
            if (!combined.some(c => c.id === b.id)) {
              combined.push({
                id: b.id,
                title: b.title,
                coverImageUrl: b.coverImageUrl,
                category: b.category,
                price: b.price,
                deletedAt: b.deletedAt,
              });
            }
          });
        }
        setItems(combined);
      }
    } catch (err) {
      console.error('Recycle bin error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecycleBin();
  }, []);

  const handleAction = async (id: string, action: 'restore' | 'permanent-delete') => {
    if (action === 'permanent-delete' && !confirm('Are you sure you want to PERMANENTLY delete this book? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(id);
      const res = await fetch(`/api/author/books/${id}/trash`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      const json = await res.json();
      if (res.ok) {
        setMessage(json.message);
        setTimeout(() => setMessage(null), 3000);
        await fetchRecycleBin();
      }
    } catch (err) {
      console.error('Action error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-theme-bg text-theme-body flex flex-col md:flex-row">
      <AuthorSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 p-6 rounded-3xl bg-theme-card border border-theme glass-card">
          <div className="flex items-center gap-3">
            <Link
              href="/author"
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-theme-muted hover:text-theme-heading transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-theme-heading font-montserrat flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-rose-500" /> Recycle Bin
              </h1>
              <p className="text-xs text-theme-muted mt-0.5">
                Soft-deleted books remain here. Existing owners retain full access. Items older than 30 days are automatically purged.
              </p>
            </div>
          </div>
        </div>

        {/* Auto-Purge Info Alert */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span>Production Auto-Purge Policy: Soft-deleted books in this bin are scheduled for hard deletion after 30 days via Vercel Cron Job. You can restore them anytime before 30 days.</span>
          </div>
        </div>

        {message && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            {message}
          </div>
        )}

        {/* Items Table / List */}
        {loading ? (
          <div className="py-12 flex justify-center items-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary-blue" />
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-theme-card border border-theme glass-card space-y-3">
            <Trash2 className="w-12 h-12 text-theme-muted mx-auto opacity-50" />
            <h3 className="text-base font-extrabold text-theme-heading font-montserrat">Recycle Bin is Empty</h3>
            <p className="text-xs text-theme-muted max-w-sm mx-auto">
              You haven&apos;t soft-deleted any books yet. Books moved to trash will appear here for 30 days before permanent purging.
            </p>
            <Link
              href="/author/books"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-blue text-white text-xs font-bold hover:bg-blue-600 transition-colors mt-2"
            >
              <BookOpen className="w-4 h-4" /> Go to My Books
            </Link>
          </div>
        ) : (
          <div className="rounded-3xl bg-theme-card border border-theme glass-card overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-theme/60 bg-theme-surface/60 text-theme-muted font-bold uppercase tracking-wider">
                    <th className="p-4">Book Title</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Deleted Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme/40">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-theme-surface/40 transition-colors">
                      <td className="p-4 font-bold text-theme-heading flex items-center gap-3">
                        <div className="relative w-10 h-12 rounded-lg bg-slate-900 overflow-hidden shrink-0 border border-theme">
                          {item.coverImageUrl ? (
                            <Image src={item.coverImageUrl} alt={item.title} fill className="object-cover" />
                          ) : (
                            <BookOpen className="w-5 h-5 text-slate-500 m-auto" />
                          )}
                        </div>
                        <span className="truncate max-w-xs">{item.title}</span>
                      </td>
                      <td className="p-4 text-theme-muted font-semibold">
                        {item.category?.name || 'eBook'}
                      </td>
                      <td className="p-4 font-bold text-theme-heading font-stats">
                        ₹{item.price}
                      </td>
                      <td className="p-4 text-theme-muted">
                        {new Date(item.deletedAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleAction(item.id, 'restore')}
                          disabled={actionLoading === item.id}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold hover:bg-emerald-500/20 transition-all inline-flex items-center gap-1.5"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Restore</span>
                        </button>

                        <button
                          onClick={() => handleAction(item.id, 'permanent-delete')}
                          disabled={actionLoading === item.id}
                          className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold hover:bg-rose-500/20 transition-all inline-flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Permanently</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
