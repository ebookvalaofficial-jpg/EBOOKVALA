'use client';

import React from 'react';
import BookCard, { BookCardData } from './BookCard';
import { BookOpen } from 'lucide-react';

interface RelatedBooksProps {
  books: BookCardData[];
  categoryName?: string;
}

export default function RelatedBooks({ books, categoryName }: RelatedBooksProps) {
  if (!books || books.length === 0) return null;

  return (
    <section className="space-y-6 pt-8 border-t border-theme">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-primary-blue flex items-center justify-center">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-theme-heading font-montserrat">
              More in {categoryName || 'this Category'}
            </h3>
            <p className="text-xs text-theme-muted">Handpicked recommendations you might also love</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {books.slice(0, 4).map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </section>
  );
}
