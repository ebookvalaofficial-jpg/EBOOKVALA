'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminCategorySchema } from '@/lib/validations/admin';
import { Save, AlertCircle } from 'lucide-react';

interface CategoryFormProps {
  initialData?: {
    id?: string;
    name: string;
    slug: string;
    icon?: string | null;
    description?: string | null;
  };
}

export default function CategoryForm({ initialData }: CategoryFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    icon: initialData?.icon || 'BookOpen',
    description: initialData?.description || '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name,
      slug: initialData?.id ? prev.slug : generateSlug(name),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = adminCategorySchema.safeParse(formData);
    if (!validation.success) {
      setError(validation.error.issues[0]?.message || 'Invalid form data');
      return;
    }

    setIsSubmitting(true);

    try {
      const url = initialData?.id ? `/api/admin/categories?id=${initialData.id}` : '/api/admin/categories';
      const method = initialData?.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validation.data),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save category');
      }

      router.push('/admin/categories');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 rounded-3xl bg-theme-card border border-theme glass-card space-y-5 text-theme-text max-w-2xl">
      {error && (
        <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-theme-heading">Category Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={handleNameChange}
            required
            className="w-full px-4 py-2.5 rounded-2xl bg-theme-surface border border-theme/60 text-xs font-semibold text-theme-heading placeholder:text-theme-muted focus:outline-none focus:border-blue-500"
            placeholder="e.g. Productivity"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-theme-heading">URL Slug *</label>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            required
            className="w-full px-4 py-2.5 rounded-2xl bg-theme-surface border border-theme/60 text-xs font-semibold text-theme-heading placeholder:text-theme-muted focus:outline-none focus:border-blue-500"
            placeholder="e.g. productivity"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-theme-heading">Lucide Icon Name</label>
        <input
          type="text"
          value={formData.icon}
          onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
          className="w-full px-4 py-2.5 rounded-2xl bg-theme-surface border border-theme/60 text-xs font-semibold text-theme-heading placeholder:text-theme-muted focus:outline-none focus:border-blue-500"
          placeholder="e.g. Zap, Brain, Sparkles, BookOpen"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-theme-heading">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="w-full px-4 py-2.5 rounded-2xl bg-theme-surface border border-theme/60 text-xs font-semibold text-theme-heading placeholder:text-theme-muted focus:outline-none focus:border-blue-500"
          placeholder="Category overview and domain focus..."
        />
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSubmitting ? 'Saving...' : initialData?.id ? 'Update Category' : 'Create Category'}</span>
        </button>
      </div>
    </form>
  );
}
