'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Star, Send, Check, Edit3, Lock } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface ExistingReview {
  id: string;
  rating: number;
  comment: string;
  userId: string;
}

interface ReviewFormProps {
  bookId: string;
  existingReview?: ExistingReview | null;
  onReviewSubmitted: () => void;
}

export default function ReviewForm({
  bookId,
  existingReview = null,
  onReviewSubmitted,
}: ReviewFormProps) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment);
    }
  }, [existingReview]);

  if (!session || !session.user) {
    return (
      <div className="p-6 rounded-3xl bg-theme-card border border-theme glass-card text-center space-y-3">
        <div className="w-10 h-10 rounded-full bg-blue-500/10 text-primary-blue flex items-center justify-center mx-auto">
          <Lock className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-bold text-theme-heading font-montserrat">Leave a Verified Review</h4>
        <p className="text-xs text-theme-muted max-w-sm mx-auto">
          Please log in to your EbookVala account to share your thoughts and rate this eBook.
        </p>
        <Link
          href={`/login?callbackUrl=${encodeURIComponent(pathname)}`}
          className="inline-flex px-5 py-2.5 rounded-xl text-xs font-bold text-white brand-gradient-bg shadow-md"
        >
          Log In to Review
        </Link>
      </div>
    );
  }

  // User already reviewed and is not currently editing
  if (existingReview && !isEditing) {
    return (
      <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/20 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-primary-blue">
            <Check className="w-4 h-4 text-emerald-500" />
            <span>You&apos;ve already reviewed this book</span>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-theme-heading bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit Review
          </button>
        </div>

        <div className="flex items-center gap-1 text-amber-400">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${i < existingReview.rating ? 'fill-amber-400' : 'text-slate-600'}`}
            />
          ))}
        </div>

        <p className="text-xs text-theme-body italic bg-theme-surface p-3 rounded-xl border border-theme">
          &quot;{existingReview.comment}&quot;
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment || comment.trim().length < 5) {
      setErrorMsg('Review comment must be at least 5 characters long.');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId,
          rating,
          comment: comment.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to submit review.');
      } else {
        setSuccessMsg('Review submitted successfully!');
        setIsEditing(false);
        onReviewSubmitted();
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 rounded-3xl bg-theme-card border border-theme glass-card space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-theme-heading font-montserrat">
          {isEditing ? 'Edit Your Review' : 'Write a Review'}
        </h4>
        {isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="text-xs text-theme-muted hover:text-theme-heading"
          >
            Cancel
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold">
          {successMsg}
        </div>
      )}

      {/* Star Selector */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-theme-muted block">Your Rating</label>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, index) => {
            const starValue = index + 1;
            return (
              <button
                key={index}
                type="button"
                onClick={() => setRating(starValue)}
                onMouseEnter={() => setHoverRating(starValue)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 text-slate-400 hover:text-amber-400 transition-colors"
              >
                <Star
                  className={`w-6 h-6 ${
                    starValue <= (hoverRating || rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-600'
                  }`}
                />
              </button>
            );
          })}
          <span className="text-xs font-bold text-amber-400 ml-2">{rating}.0 Stars</span>
        </div>
      </div>

      {/* Comment Textarea */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-theme-muted block">Your Review</label>
        <textarea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share what you liked, key learnings, or why others should read this eBook..."
          className="w-full p-3.5 rounded-2xl bg-theme-surface border border-theme text-xs text-theme-heading placeholder:text-theme-muted focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="px-6 py-2.5 rounded-xl text-xs font-bold text-white brand-gradient-bg shadow-md hover:shadow-lg flex items-center gap-2 transition-all disabled:opacity-60"
      >
        {isSubmitting ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <Send className="w-3.5 h-3.5" /> Submit Review
          </>
        )}
      </button>
    </form>
  );
}
