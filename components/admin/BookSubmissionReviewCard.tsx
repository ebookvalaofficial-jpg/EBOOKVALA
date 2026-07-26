'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { BookOpen, CheckCircle2, XCircle, RefreshCw, Layers } from 'lucide-react';

interface BookSubmissionReviewCardProps {
  submission: {
    id: string;
    title: string;
    description: string;
    price: number;
    coverImageUrl: string;
    manuscriptChapters: string;
    status: string;
    submittedAt?: string | null;
    category?: { name: string } | null;
    authorUser?: {
      name?: string | null;
      email: string;
    } | null;
  };
  onReviewed?: () => void;
}

export default function BookSubmissionReviewCard({
  submission,
  onReviewed,
}: BookSubmissionReviewCardProps) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReview = async (action: 'APPROVE' | 'REJECT') => {
    if (action === 'REJECT' && !rejectionReason.trim()) {
      setError('Please provide a rejection reason before rejecting');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/book-submissions/${submission.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, rejectionReason }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to review submission');
        return;
      }

      if (onReviewed) onReviewed();
    } catch (err) {
      setError('Network error processing book submission');
    } finally {
      setIsLoading(false);
    }
  };

  const chapters: Array<{ title: string; content: string }> = JSON.parse(
    submission.manuscriptChapters || '[]'
  );

  return (
    <div className="p-6 rounded-3xl bg-theme-card border border-theme glass-card space-y-6 text-theme-text font-inter shadow-xl">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-theme/60 pb-4">
        <div className="flex gap-4">
          <div className="relative w-20 h-28 rounded-2xl overflow-hidden bg-theme-surface border border-theme/60 shrink-0">
            {submission.coverImageUrl ? (
              <Image
                src={submission.coverImageUrl}
                alt={submission.title}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <BookOpen className="w-8 h-8 text-theme-muted m-auto" />
            )}
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-theme-heading font-montserrat">{submission.title}</h3>
            <p className="text-xs text-theme-muted">
              By {submission.authorUser?.name || 'Author'} ({submission.authorUser?.email})
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase">
                {submission.category?.name || 'eBook'}
              </span>
              <span className="text-xs font-black text-amber-500 font-stats">₹{submission.price}</span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold">
          {error}
        </div>
      )}

      {/* Description */}
      <div className="space-y-1">
        <span className="text-[10px] font-black uppercase text-theme-muted">Description</span>
        <p className="text-xs font-semibold text-theme-heading leading-relaxed bg-theme-surface/40 p-3.5 rounded-2xl border border-theme/40">
          {submission.description}
        </p>
      </div>

      {/* Manuscript Chapters Preview */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-theme-heading">
          <Layers className="w-4 h-4 text-amber-500" />
          <span>Manuscript Chapters ({chapters.length})</span>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto">
          {chapters.map((ch, idx) => (
            <div key={idx} className="p-3 rounded-2xl bg-theme-surface/60 border border-theme/40 text-xs space-y-1">
              <strong className="font-bold text-theme-heading block">{ch.title}</strong>
              <p className="text-theme-muted truncate">{ch.content.replace(/<[^>]*>?/gm, '')}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Admin Action Controls */}
      <div className="space-y-3 pt-3 border-t border-theme/40">
        <input
          type="text"
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          placeholder="Rejection reason / required revisions (required if rejecting)..."
          className="w-full px-4 py-2 rounded-2xl bg-theme-surface border border-theme/60 text-xs font-semibold text-theme-heading focus:outline-none"
        />

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={() => handleReview('REJECT')}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-40"
          >
            {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
            <span>Reject Submission</span>
          </button>

          <button
            onClick={() => handleReview('APPROVE')}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-md transition-all flex items-center gap-1.5 disabled:opacity-40"
          >
            {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            <span>Approve & Publish Live to Store</span>
          </button>
        </div>
      </div>
    </div>
  );
}
