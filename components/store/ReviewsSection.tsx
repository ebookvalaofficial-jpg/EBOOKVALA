'use client';

import React from 'react';
import Image from 'next/image';
import { Star, MessageSquare } from 'lucide-react';
import ReviewForm from './ReviewForm';
import { useSession } from 'next-auth/react';

export interface ReviewData {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    id: string;
    name?: string | null;
    image?: string | null;
  };
}

interface ReviewsSectionProps {
  bookId: string;
  reviews: ReviewData[];
  onReviewSubmitted: () => void;
}

export default function ReviewsSection({
  bookId,
  reviews,
  onReviewSubmitted,
}: ReviewsSectionProps) {
  const { data: session } = useSession();

  const userEmail = session?.user?.email;
  const userId = (session?.user as any)?.id;

  // Find if current logged in user has an existing review
  const existingReview = reviews.find((r) => r.user.id === userId || (session?.user?.name && r.user.name === session.user.name));

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : '0.0';

  return (
    <div className="space-y-8">
      {/* Header Stat & Rating Summary */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-theme-card border border-theme glass-card">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex flex-col items-center justify-center shrink-0 border border-amber-500/20 font-stats font-bold">
            <span className="text-xl leading-none">{averageRating}</span>
            <span className="text-[10px] text-theme-muted font-normal mt-0.5">out of 5</span>
          </div>

          <div>
            <h3 className="text-lg font-bold text-theme-heading font-montserrat">Customer Reviews</h3>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(Number(averageRating))
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-theme-muted">Based on {reviews.length} verified reviews</span>
            </div>
          </div>
        </div>
      </div>

      {/* Review Form Component */}
      <ReviewForm
        bookId={bookId}
        existingReview={existingReview ? { id: existingReview.id, rating: existingReview.rating, comment: existingReview.comment, userId: existingReview.user.id } : null}
        onReviewSubmitted={onReviewSubmitted}
      />

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-theme-surface border border-theme/60 space-y-2">
            <MessageSquare className="w-8 h-8 text-theme-muted mx-auto" />
            <p className="text-sm font-semibold text-theme-heading">No reviews yet</p>
            <p className="text-xs text-theme-muted">Be the first to review this eBook and help fellow readers!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className="p-5 rounded-2xl bg-theme-card border border-theme glass-card space-y-3 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative w-9 h-9 rounded-full overflow-hidden bg-blue-500/10 text-primary-blue flex items-center justify-center font-bold text-xs shrink-0 border border-theme">
                    {review.user.image ? (
                      <Image src={review.user.image} alt={review.user.name || 'User'} fill className="object-cover" />
                    ) : (
                      <span>{(review.user.name || 'U').charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-theme-heading block">
                      {review.user.name || 'Anonymous Reader'}
                    </span>
                    <span className="text-[10px] text-theme-muted">
                      {new Date(review.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-0.5 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < review.rating ? 'fill-amber-400' : 'text-slate-600'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-xs text-theme-body leading-relaxed pl-12 font-inter">
                {review.comment}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
