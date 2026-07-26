'use client';

import React from 'react';
import BookCard, { BookCardData } from './BookCard';
import { BookOpen, RefreshCw } from 'lucide-react';

interface BookGridProps {
  books: BookCardData[];
  isLoading?: boolean;
  emptyMessage?: string;
  onResetFilters?: () => void;
  onAddToCartSuccess?: () => void;
}

export default function BookGrid({
  books,
  isLoading = false,
  emptyMessage = 'No eBooks found matching your filters.',
  onResetFilters,
  onAddToCartSuccess,
}: BookGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl bg-theme-card border border-theme p-4 space-y-4 animate-pulse h-[450px]"
          >
            <div className="w-full h-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
            <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="rounded-3xl bg-theme-card border border-theme glass-card p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto my-12 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-primary-blue flex items-center justify-center">
          <BookOpen className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-theme-heading font-montserrat">No Books Found</h3>
        <p className="text-sm text-theme-body leading-relaxed">{emptyMessage}</p>
        {onResetFilters && (
          <button
            onClick={onResetFilters}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white brand-gradient-bg shadow-md hover:shadow-lg flex items-center gap-2 transition-all mt-2"
          >
            <RefreshCw className="w-4 h-4" /> Clear All Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {books.map((book, index) => (
        <BookCard key={book.id} book={book} onAddToCartSuccess={onAddToCartSuccess} priorityImage={index < 4} />
      ))}
    </div>
  );
}
