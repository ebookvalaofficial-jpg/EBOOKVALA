'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { adminBookSchema } from '@/lib/validations/admin';
import { Save, AlertCircle, Plus, Trash2, ArrowUp, ArrowDown, BookOpen } from 'lucide-react';

interface AuthorOption {
  id: string;
  name: string;
}

interface CategoryOption {
  id: string;
  name: string;
}

interface ChapterItem {
  id?: string;
  order: number;
  title: string;
  content: string;
}

interface BookFormProps {
  authors: AuthorOption[];
  categories: CategoryOption[];
  initialData?: {
    id?: string;
    title: string;
    slug: string;
    authorId: string;
    categoryId: string;
    description: string;
    price: number;
    originalPrice?: number | null;
    discountPercent?: number | null;
    coverImageUrl: string;
    pageCount: number;
    language: string;
    format: string;
    isBestseller: boolean;
    isFeatured: boolean;
    isTrending: boolean;
    chapters?: ChapterItem[];
  };
}

export default function BookForm({ authors, categories, initialData }: BookFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState<{
    title: string;
    slug: string;
    authorId: string;
    categoryId: string;
    description: string;
    price: number;
    originalPrice: number | null;
    discountPercent: number | null;
    coverImageUrl: string;
    pageCount: number;
    language: string;
    format: string;
    isBestseller: boolean;
    isFeatured: boolean;
    isTrending: boolean;
  }>({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    authorId: initialData?.authorId || (authors[0]?.id || ''),
    categoryId: initialData?.categoryId || (categories[0]?.id || ''),
    description: initialData?.description || '',
    price: initialData?.price ?? 499,
    originalPrice: initialData?.originalPrice ?? 999,
    discountPercent: initialData?.discountPercent ?? 50,
    coverImageUrl: initialData?.coverImageUrl || '',
    pageCount: initialData?.pageCount ?? 250,
    language: initialData?.language || 'English',
    format: initialData?.format || 'EPUB, PDF',
    isBestseller: initialData?.isBestseller ?? false,
    isFeatured: initialData?.isFeatured ?? false,
    isTrending: initialData?.isTrending ?? false,
  });

  const [chapters, setChapters] = useState<ChapterItem[]>(
    initialData?.chapters && initialData.chapters.length > 0
      ? initialData.chapters
      : [
          { order: 1, title: 'Chapter 1: Foundations & Mindset', content: '<p>Welcome to Chapter 1. Here begins the journey into core principles.</p>' },
          { order: 2, title: 'Chapter 2: Tactical Execution', content: '<p>In Chapter 2, we implement actionable frameworks for daily progress.</p>' },
        ]
  );

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title,
      slug: initialData?.id ? prev.slug : generateSlug(title),
    }));
  };

  // Chapter handlers
  const handleAddChapter = () => {
    const nextOrder = chapters.length + 1;
    setChapters([
      ...chapters,
      {
        order: nextOrder,
        title: `Chapter ${nextOrder}: New Section`,
        content: `<p>Content for Chapter ${nextOrder}...</p>`,
      },
    ]);
  };

  const handleRemoveChapter = (index: number) => {
    const updated = chapters.filter((_, i) => i !== index);
    // re-index order
    const reordered = updated.map((ch, idx) => ({ ...ch, order: idx + 1 }));
    setChapters(reordered);
  };

  const handleMoveChapter = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === chapters.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const copy = [...chapters];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    // re-index order
    const reordered = copy.map((ch, idx) => ({ ...ch, order: idx + 1 }));
    setChapters(reordered);
  };

  const handleChapterChange = (index: number, field: 'title' | 'content', value: string) => {
    const updated = [...chapters];
    updated[index] = { ...updated[index], [field]: value };
    setChapters(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = adminBookSchema.safeParse({
      ...formData,
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
      discountPercent: formData.discountPercent ? Number(formData.discountPercent) : null,
      pageCount: Number(formData.pageCount),
      chapters,
    });

    if (!validation.success) {
      setError(validation.error.issues[0]?.message || 'Invalid form data');
      return;
    }

    setIsSubmitting(true);

    try {
      const url = initialData?.id ? `/api/admin/books/${initialData.id}` : '/api/admin/books';
      const method = initialData?.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validation.data),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save book');
      }

      router.push('/admin/books');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 text-theme-text max-w-4xl">
      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Details Section */}
      <div className="p-6 rounded-3xl bg-theme-card border border-theme glass-card space-y-6">
        <h3 className="text-base font-bold text-theme-heading font-montserrat border-b border-theme/60 pb-3">
          Book Metadata & Pricing
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cover Preview Column */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-theme-heading">Cover Image Preview</label>
            <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-theme-surface border border-theme/60 shadow-md flex items-center justify-center">
              {formData.coverImageUrl ? (
                <Image
                  src={formData.coverImageUrl}
                  alt={formData.title || 'Cover'}
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <div className="text-center p-4 text-theme-muted space-y-2">
                  <BookOpen className="w-8 h-8 mx-auto text-blue-500 opacity-60" />
                  <span className="text-[11px] block font-semibold">Paste Image URL below</span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-theme-heading">Cover Image URL *</label>
              <input
                type="url"
                value={formData.coverImageUrl}
                onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                required
                className="w-full px-3.5 py-2 rounded-2xl bg-theme-surface border border-theme/60 text-xs font-semibold text-theme-heading focus:outline-none focus:border-blue-500"
                placeholder="https://images.unsplash.com/..."
              />
            </div>
          </div>

          {/* Form Fields Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-theme-heading">Book Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={handleTitleChange}
                  required
                  className="w-full px-4 py-2.5 rounded-2xl bg-theme-surface border border-theme/60 text-xs font-semibold text-theme-heading focus:outline-none focus:border-blue-500"
                  placeholder="e.g. Atomic Mastery"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-theme-heading">URL Slug *</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-2xl bg-theme-surface border border-theme/60 text-xs font-semibold text-theme-heading focus:outline-none focus:border-blue-500"
                  placeholder="e.g. atomic-mastery"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-theme-heading">Author *</label>
                <select
                  value={formData.authorId}
                  onChange={(e) => setFormData({ ...formData, authorId: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-2xl bg-theme-surface border border-theme/60 text-xs font-semibold text-theme-heading focus:outline-none focus:border-blue-500"
                >
                  {authors.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-theme-heading">Category *</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-2xl bg-theme-surface border border-theme/60 text-xs font-semibold text-theme-heading focus:outline-none focus:border-blue-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-theme-heading">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={3}
                className="w-full px-4 py-2.5 rounded-2xl bg-theme-surface border border-theme/60 text-xs font-semibold text-theme-heading focus:outline-none focus:border-blue-500"
                placeholder="Comprehensive eBook description, key takeaways, and outline..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-theme-heading">Price (₹) *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  required
                  min={0}
                  className="w-full px-4 py-2.5 rounded-2xl bg-theme-surface border border-theme/60 text-xs font-semibold text-theme-heading focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-theme-heading">Original Price (₹)</label>
                <input
                  type="number"
                  value={formData.originalPrice || ''}
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value ? Number(e.target.value) : null })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-theme-surface border border-theme/60 text-xs font-semibold text-theme-heading focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-theme-heading">Discount (%)</label>
                <input
                  type="number"
                  value={formData.discountPercent || ''}
                  onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value ? Number(e.target.value) : null })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-theme-surface border border-theme/60 text-xs font-semibold text-theme-heading focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Feature Flags */}
            <div className="flex flex-wrap gap-4 pt-2">
              <label className="flex items-center gap-2 p-2.5 rounded-2xl border border-theme/60 cursor-pointer text-xs font-bold">
                <input
                  type="checkbox"
                  checked={formData.isBestseller}
                  onChange={(e) => setFormData({ ...formData, isBestseller: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span>🔥 Bestseller Badge</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-2xl border border-theme/60 cursor-pointer text-xs font-bold">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span>⭐ Hero Featured</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-2xl border border-theme/60 cursor-pointer text-xs font-bold">
                <input
                  type="checkbox"
                  checked={formData.isTrending}
                  onChange={(e) => setFormData({ ...formData, isTrending: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span>📈 Trending Now</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Chapters Management Section */}
      <div className="p-6 rounded-3xl bg-theme-card border border-theme glass-card space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-theme/60">
          <div>
            <h3 className="text-base font-bold text-theme-heading font-montserrat">Reader Chapters Content</h3>
            <p className="text-xs text-theme-muted">Manage chapter text rendered inside Phase 5 web reader</p>
          </div>

          <button
            type="button"
            onClick={handleAddChapter}
            className="px-4 py-2 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-500 hover:bg-blue-600 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Chapter</span>
          </button>
        </div>

        <div className="space-y-4">
          {chapters.length === 0 ? (
            <p className="text-xs text-center p-6 text-theme-muted">No chapters added yet. Click &quot;Add Chapter&quot; above.</p>
          ) : (
            chapters.map((ch, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-theme-surface/60 border border-theme/60 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="px-2.5 py-1 rounded-xl bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase">
                    Order #{ch.order}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleMoveChapter(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1.5 rounded-xl border border-theme/60 hover:bg-slate-500/10 disabled:opacity-30 transition-colors"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMoveChapter(idx, 'down')}
                      disabled={idx === chapters.length - 1}
                      className="p-1.5 rounded-xl border border-theme/60 hover:bg-slate-500/10 disabled:opacity-30 transition-colors"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemoveChapter(idx)}
                      className="p-1.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors ml-2"
                      title="Remove Chapter"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={ch.title}
                    onChange={(e) => handleChapterChange(idx, 'title', e.target.value)}
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-theme-card border border-theme/60 text-xs font-bold text-theme-heading focus:outline-none focus:border-blue-500"
                    placeholder="Chapter Title"
                  />
                </div>

                <div className="space-y-1.5">
                  <textarea
                    value={ch.content}
                    onChange={(e) => handleChapterChange(idx, 'content', e.target.value)}
                    required
                    rows={3}
                    className="w-full px-3.5 py-2 rounded-xl bg-theme-card border border-theme/60 text-xs font-normal text-theme-text focus:outline-none focus:border-blue-500 font-mono"
                    placeholder="Chapter HTML or structured text content..."
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Submit CTA */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-8 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black tracking-wide uppercase transition-all shadow-xl flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSubmitting ? 'Saving...' : initialData?.id ? 'Save Book Changes' : 'Create New Book'}</span>
        </button>
      </div>
    </form>
  );
}
