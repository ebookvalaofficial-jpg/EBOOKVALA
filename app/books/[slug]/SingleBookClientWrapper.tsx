'use client';

import React, { useState } from 'react';
import BookDetailHero from '@/components/store/BookDetailHero';
import ReviewsSection from '@/components/store/ReviewsSection';
import RelatedBooks from '@/components/store/RelatedBooks';

interface SingleBookClientWrapperProps {
  initialBook: any;
  initialRelated: any[];
}

export default function SingleBookClientWrapper({
  initialBook,
  initialRelated,
}: SingleBookClientWrapperProps) {
  const [book, setBook] = useState(initialBook);

  const refreshReviews = async () => {
    try {
      const res = await fetch(`/api/books/${book.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.book) {
          setBook(data.book);
        }
      }
    } catch (err) {
      console.error('Error refreshing reviews:', err);
    }
  };

  return (
    <div className="space-y-12">
      {/* Book Detail Hero Section */}
      <BookDetailHero book={book} />

      {/* Full Description Section */}
      <div className="p-8 rounded-3xl bg-theme-card border border-theme glass-card space-y-4">
        <h3 className="text-xl font-bold text-theme-heading font-montserrat">About this eBook</h3>
        <p className="text-sm sm:text-base text-theme-body leading-relaxed whitespace-pre-line font-inter">
          {book.description}
        </p>
      </div>

      {/* Reviews Section */}
      <ReviewsSection
        bookId={book.id}
        reviews={book.reviews}
        onReviewSubmitted={refreshReviews}
      />

      {/* Related Books Section */}
      <RelatedBooks books={initialRelated} categoryName={book.category?.name} />
    </div>
  );
}
