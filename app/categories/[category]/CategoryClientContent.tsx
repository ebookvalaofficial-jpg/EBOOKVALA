'use client';

import React, { useState } from 'react';
import BookGrid from '@/components/store/BookGrid';
import BookSearch from '@/components/store/BookSearch';
import { BookOpen, Sparkles } from 'lucide-react';

interface CategoryClientContentProps {
  category: any;
  initialBooks: any[];
}

export default function CategoryClientContent({
  category,
  initialBooks,
}: CategoryClientContentProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBooks = initialBooks.filter((book) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      book.title.toLowerCase().includes(term) ||
      book.author.name.toLowerCase().includes(term) ||
      book.description.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-8">
      {/* Category Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-slate-900/60 border border-theme p-8 sm:p-10 overflow-hidden glass-card">
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-primary-blue bg-blue-500/10 border border-blue-500/20">
            <Sparkles className="w-3.5 h-3.5 text-accent-gold" /> Category Collection
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-theme-heading leading-tight font-montserrat">
            {category.name} eBooks
          </h1>
          <p className="text-sm sm:text-base text-theme-body leading-relaxed font-inter">
            {category.description || `Discover handpicked ${category.name} eBooks on EbookVala.`}
          </p>
          <span className="inline-block text-xs font-bold text-theme-muted pt-1">
            {initialBooks.length} Available eBooks
          </span>
        </div>
      </div>

      {/* Live Search */}
      <div className="max-w-md">
        <BookSearch
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder={`Search within ${category.name}...`}
        />
      </div>

      {/* Book Grid */}
      <BookGrid
        books={filteredBooks}
        emptyMessage={`No ${category.name} eBooks found matching "${searchTerm}".`}
        onResetFilters={() => setSearchTerm('')}
      />
    </div>
  );
}
