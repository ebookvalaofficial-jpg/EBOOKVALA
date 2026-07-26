'use client';

import React, { useState, useEffect } from 'react';
import DataTable, { ColumnDef } from '@/components/admin/DataTable';
import ConfirmActionDialog from '@/components/admin/ConfirmActionDialog';
import AdminBreadcrumbs from '@/components/admin/AdminBreadcrumbs';
import { EyeOff, Eye, Trash2, Star, MessageSquare } from 'lucide-react';
import { formatRelativeTime, formatFullDate } from '@/lib/formatters';

interface ReviewRow {
  id: string;
  rating: number;
  comment: string;
  isHidden: boolean;
  createdAt: string;
  user: { name: string; email: string };
  book: { title: string; coverImageUrl: string };
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<ReviewRow | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/admin/reviews');
      const data = await res.json();
      if (res.ok && data.reviews) {
        setReviews(data.reviews);
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleToggleHide = async (row: ReviewRow) => {
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: row.id, isHidden: !row.isHidden }),
      });
      if (res.ok) {
        fetchReviews();
      }
    } catch (err) {
      console.error('Error moderating review:', err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedReview) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/reviews?id=${selectedReview.id}`, { method: 'DELETE' });
      if (res.ok) {
        setIsDeleteModalOpen(false);
        setSelectedReview(null);
        fetchReviews();
      }
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: ColumnDef<ReviewRow>[] = [
    {
      header: 'eBook',
      cell: (row) => (
        <span className="font-bold text-theme-heading text-xs line-clamp-1">{row.book?.title || 'eBook'}</span>
      ),
    },
    {
      header: 'Reviewer',
      cell: (row) => (
        <div>
          <p className="font-bold text-theme-heading text-xs">{row.user?.name || 'Reviewer'}</p>
          <p className="text-[10px] text-theme-muted">{row.user?.email}</p>
        </div>
      ),
    },
    {
      header: 'Rating',
      accessorKey: 'rating',
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-1 text-amber-400 text-xs font-black">
          <Star className="w-3.5 h-3.5 fill-current" />
          <span>{row.rating}.0</span>
        </div>
      ),
    },
    {
      header: 'Comment',
      cell: (row) => (
        <p className="text-xs text-theme-text max-w-sm line-clamp-2 italic">&quot;{row.comment}&quot;</p>
      ),
    },
    {
      header: 'Submitted',
      cell: (row) => (
        <span className="text-[11px] text-theme-muted" title={formatFullDate(row.createdAt)}>
          {formatRelativeTime(row.createdAt)}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (row) => (
        <span
          className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${
            row.isHidden
              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
              : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
          }`}
        >
          {row.isHidden ? 'Hidden' : 'Visible'}
        </span>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      cell: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => handleToggleHide(row)}
            className={`p-2 rounded-xl border transition-colors ${
              row.isHidden
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-600 hover:text-white'
                : 'bg-amber-500/10 border-amber-500/20 text-amber-500 hover:bg-amber-600 hover:text-white'
            }`}
            title={row.isHidden ? 'Restore Review to Public Display' : 'Hide Review from Public Display'}
          >
            {row.isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => {
              setSelectedReview(row);
              setIsDeleteModalOpen(true);
            }}
            className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-600 hover:text-white transition-colors"
            title="Delete Review"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-theme-text font-inter">
      <AdminBreadcrumbs
        title="Review Moderation"
        description="Moderate reader book ratings, hide inappropriate comments, or permanently delete spam reviews"
      />

      {isLoading ? (
        <div className="p-12 text-center text-xs font-bold text-theme-muted bg-theme-card rounded-3xl border border-theme animate-pulse">
          Loading reviews...
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={reviews}
          searchPlaceholder="Search reviews by book title, comment, or user..."
          searchFilterKey={(row) => `${row.book?.title} ${row.comment} ${row.user?.email}`}
          pageSize={10}
          emptyTitle="No Reviews Found"
          emptyDescription="No customer reviews match your search or filter."
          emptyIcon={MessageSquare}
        />
      )}

      <ConfirmActionDialog
        isOpen={isDeleteModalOpen}
        title="Delete Review"
        description={
          <span>
            Are you sure you want to delete this review by <strong className="text-white">{selectedReview?.user?.email}</strong>?
          </span>
        }
        confirmText="Confirm Delete"
        confirmButtonClass="bg-red-600 hover:bg-red-500 text-white"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
}
