'use client';

import React, { useState, useEffect } from 'react';
import DataTable, { ColumnDef } from '@/components/admin/DataTable';
import AdminBreadcrumbs from '@/components/admin/AdminBreadcrumbs';
import { RefreshCw, Star } from 'lucide-react';
import { formatRelativeTime } from '@/lib/formatters';

interface FeedbackItem {
  id: string;
  name?: string;
  email?: string;
  rating: number;
  comments: string;
  createdAt: string;
}

export default function AdminFeedbackPage() {
  const [data, setData] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFeedback = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/feedback');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const columns: ColumnDef<FeedbackItem>[] = [
    {
      header: 'User',
      accessorKey: 'name',
      cell: (row) => (
        <div>
          <p className="font-bold text-theme-heading text-xs">{row.name || 'Anonymous'}</p>
          <p className="text-[11px] text-theme-muted">{row.email || 'N/A'}</p>
        </div>
      ),
    },
    {
      header: 'Rating',
      accessorKey: 'rating',
      cell: (row) => (
        <div className="flex items-center gap-1 text-amber-400 font-bold text-xs">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-3.5 h-3.5 ${i < row.rating ? 'fill-amber-400' : 'text-slate-700'}`}
            />
          ))}
          <span className="ml-1 text-theme-heading">{row.rating}/5</span>
        </div>
      ),
    },
    {
      header: 'Comments',
      accessorKey: 'comments',
      cell: (row) => (
        <p className="text-xs text-theme-body max-w-md leading-relaxed" title={row.comments}>
          {row.comments}
        </p>
      ),
    },
    {
      header: 'Submitted',
      accessorKey: 'createdAt',
      cell: (row) => (
        <span className="text-xs text-theme-muted font-mono">{formatRelativeTime(row.createdAt)}</span>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <AdminBreadcrumbs
        title="User Feedback & Ratings"
        description="Review user experience ratings, suggestions, and platform testimonials."
        action={
          <button
            onClick={fetchFeedback}
            className="px-3.5 py-2 rounded-xl border border-theme bg-theme-card hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-theme-heading flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh List
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        searchPlaceholder="Search feedback comments..."
        searchKey="comments"
      />
    </div>
  );
}
