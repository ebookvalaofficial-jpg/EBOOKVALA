'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Plus, Trash2, Save, Send, RefreshCw, BookOpen, Layers } from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
}

interface ChapterDraft {
  title: string;
  content: string;
}

interface BookSubmissionFormProps {
  categories: CategoryItem[];
  initialData?: {
    id?: string;
    title: string;
    description: string;
    categoryId: string;
    coverImageUrl: string;
    price: number;
    manuscriptChapters: ChapterDraft[];
    status?: string;
    rejectionReason?: string | null;
  };
}

export default function BookSubmissionForm({
  categories,
  initialData,
}: BookSubmissionFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    categoryId: initialData?.categoryId || (categories[0]?.id || ''),
    coverImageUrl: initialData?.coverImageUrl || '',
    price: initialData?.price ?? 299,
  });

  const [chapters, setChapters] = useState<ChapterDraft[]>(
    initialData?.manuscriptChapters?.length
      ? initialData.manuscriptChapters
      : [
          {
            title: 'Chapter 1: Introduction',
            content: '<p>Write your chapter text here...</p>',
          },
        ]
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddChapter = () => {
    setChapters((prev) => [
      ...prev,
      {
        title: `Chapter ${prev.length + 1}`,
        content: '<p>Write your chapter content here...</p>',
      },
    ]);
  };

  const handleRemoveChapter = (index: number) => {
    if (chapters.length <= 1) return;
    setChapters((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleChapterChange = (index: number, field: keyof ChapterDraft, value: string) => {
    setChapters((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSubmit = async (isSubmitForReview: boolean) => {
    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        categoryId: formData.categoryId,
        coverImageUrl: formData.coverImageUrl,
        price: Number(formData.price),
        manuscriptChapters: chapters,
        isSubmitForReview,
      };

      const url = initialData?.id ? `/api/author/books/${initialData.id}` : '/api/author/books';
      const method = initialData?.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to save submission');
        return;
      }

      router.push('/author/books');
      router.refresh();
    } catch (err: any) {
      setError('Network error saving book submission');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-inter text-theme-text">
      {initialData?.rejectionReason && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs space-y-1">
          <strong className="font-bold">Rejection Feedback from Admin Review:</strong>
          <p className="text-theme-text">{initialData.rejectionReason}</p>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Metadata */}
        <div className="lg:col-span-2 space-y-6 p-6 rounded-3xl bg-theme-card border border-theme glass-card shadow-xl">
          <h3 className="text-base font-bold text-theme-heading font-montserrat border-b border-theme/60 pb-3">
            Book Details & Metadata
          </h3>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-theme-heading">Book Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Master Class on High Output Management"
              className="w-full px-4 py-2.5 rounded-2xl bg-theme-surface border border-theme/60 text-xs font-semibold text-theme-heading focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-theme-heading">Description (Min 20 chars) *</label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Write a compelling store summary for your readers..."
              className="w-full px-4 py-2.5 rounded-2xl bg-theme-surface border border-theme/60 text-xs font-semibold text-theme-heading focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-theme-heading">Category *</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-4 py-2.5 rounded-2xl bg-theme-surface border border-theme/60 text-xs font-semibold text-theme-heading focus:outline-none focus:border-amber-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-theme-heading">Price (₹ INR) *</label>
              <input
                type="number"
                min={0}
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-2xl bg-theme-surface border border-theme/60 text-xs font-semibold text-theme-heading focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-theme-heading">Cover Image URL *</label>
            <input
              type="text"
              required
              value={formData.coverImageUrl}
              onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full px-4 py-2.5 rounded-2xl bg-theme-surface border border-theme/60 text-xs font-semibold text-theme-heading focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Right Column: Cover Preview */}
        <div className="p-6 rounded-3xl bg-theme-card border border-theme glass-card shadow-xl space-y-4 text-center">
          <h3 className="text-sm font-bold text-theme-heading font-montserrat border-b border-theme/60 pb-3">
            Cover Preview
          </h3>

          <div className="relative w-44 h-64 mx-auto rounded-2xl overflow-hidden shadow-xl bg-theme-surface border border-theme/60 flex items-center justify-center">
            {formData.coverImageUrl ? (
              <Image
                src={formData.coverImageUrl}
                alt="Book cover preview"
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <BookOpen className="w-10 h-10 text-theme-muted" />
            )}
          </div>

          <p className="text-[11px] text-theme-muted">
            High quality portrait cover image recommended (3:4 ratio).
          </p>
        </div>
      </div>

      {/* Chapters Editor Section */}
      <div className="p-6 rounded-3xl bg-theme-card border border-theme glass-card shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-theme/60 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-theme-heading font-montserrat">Manuscript Chapters</h3>
          </div>

          <button
            type="button"
            onClick={handleAddChapter}
            className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Chapter</span>
          </button>
        </div>

        <div className="space-y-6">
          {chapters.map((chap, idx) => (
            <div key={idx} className="p-4 sm:p-6 rounded-2xl bg-theme-surface/50 border border-theme/60 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-black uppercase text-amber-500 font-montserrat">
                  Chapter {idx + 1}
                </span>

                {chapters.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveChapter(idx)}
                    className="p-1.5 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white text-xs transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="space-y-1.5">
                <input
                  type="text"
                  value={chap.title}
                  onChange={(e) => handleChapterChange(idx, 'title', e.target.value)}
                  placeholder="Chapter Title"
                  className="w-full px-4 py-2 rounded-xl bg-theme-surface border border-theme/60 text-xs font-bold text-theme-heading"
                />
              </div>

              <div className="space-y-1.5">
                <textarea
                  rows={6}
                  value={chap.content}
                  onChange={(e) => handleChapterChange(idx, 'content', e.target.value)}
                  placeholder="Chapter HTML or Plain Text Content..."
                  className="w-full px-4 py-3 rounded-xl bg-theme-surface border border-theme/60 text-xs font-semibold text-theme-text font-mono focus:outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form Action Buttons */}
      <div className="flex flex-wrap items-center justify-end gap-3 pt-4">
        <button
          type="button"
          disabled={isLoading}
          onClick={() => handleSubmit(false)}
          className="px-6 py-3 rounded-2xl bg-theme-surface border border-theme/60 text-theme-heading hover:bg-slate-500/10 text-xs font-bold flex items-center gap-2 transition-all"
        >
          <Save className="w-4 h-4" />
          <span>Save as Draft</span>
        </button>

        <button
          type="button"
          disabled={isLoading}
          onClick={() => handleSubmit(true)}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white text-xs font-extrabold uppercase tracking-wide shadow-xl flex items-center gap-2 transition-all disabled:opacity-40"
        >
          {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          <span>Submit for Review</span>
        </button>
      </div>
    </div>
  );
}
