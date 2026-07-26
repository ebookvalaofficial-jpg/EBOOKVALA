'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import BookGrid from '@/components/store/BookGrid';
import BookSearch from '@/components/store/BookSearch';
import BookFilters, { FilterState } from '@/components/store/BookFilters';
import { BookCardData } from '@/components/store/BookCard';
import { Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const defaultFilters: FilterState = {
  category: [],
  priceMin: undefined,
  priceMax: undefined,
  ratingMin: undefined,
  format: '',
  sort: 'popular',
};

const fallbackCategories = [
  { id: '1', slug: 'fiction', name: 'Fiction' },
  { id: '2', slug: 'non-fiction', name: 'Non-Fiction' },
  { id: '3', slug: 'self-help', name: 'Self Help' },
  { id: '4', slug: 'biography', name: 'Biography' },
  { id: '5', slug: 'comic', name: 'Comic' },
  { id: '6', slug: 'business-finance', name: 'Business & Finance' },
];

function StoreContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category');
  const initialQuery = searchParams.get('q') || searchParams.get('search');

  const [books, setBooks] = useState<BookCardData[]>([]);
  const [categories, setCategories] = useState<any[]>(fallbackCategories);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(initialQuery || '');
  const [filters, setFilters] = useState<FilterState>({
    ...defaultFilters,
    category: initialCategory ? [initialCategory] : [],
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Sync state if URL params change
  useEffect(() => {
    if (initialCategory || initialQuery) {
      setFilters((prev) => ({
        ...prev,
        category: initialCategory ? [initialCategory] : prev.category,
      }));
      if (initialQuery) {
        setSearchTerm(initialQuery);
      }
    }
  }, [initialCategory, initialQuery]);

  // Fetch Categories for Filter Sidebar
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          if (data.categories && data.categories.length > 0) {
            setCategories(data.categories);
          }
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    }
    fetchCategories();
  }, []);

  const fetchBooks = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set('search', searchTerm);
      if (filters.category.length > 0) params.set('category', filters.category.join(','));
      if (filters.priceMin !== undefined) params.set('priceMin', filters.priceMin.toString());
      if (filters.priceMax !== undefined) params.set('priceMax', filters.priceMax.toString());
      if (filters.ratingMin !== undefined) params.set('ratingMin', filters.ratingMin.toString());
      if (filters.format) params.set('format', filters.format);
      if (filters.sort) params.set('sort', filters.sort);
      params.set('page', page.toString());
      params.set('limit', '12');

      const res = await fetch(`/api/books?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setBooks(data.books || []);
        setTotalPages(data.totalPages || 1);
        setTotalBooks(data.total || 0);
      }
    } catch (err) {
      console.error('Error fetching store books:', err);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, filters, page]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  // Reset page when filters change
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
    setSearchTerm('');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-theme-bg text-theme-body flex flex-col justify-between pt-28 pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 space-y-8">
        
        {/* Live Search Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 w-full">
            <BookSearch
              value={searchTerm}
              onChange={(val) => {
                setSearchTerm(val);
                setPage(1);
              }}
            />
          </div>

          <button
            onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
            className="lg:hidden w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-theme-card border border-theme text-xs font-bold text-theme-heading flex items-center justify-center gap-2 shadow-sm"
          >
            <Filter className="w-4 h-4 text-primary-blue" />
            <span>Filters ({filters.category.length})</span>
          </button>
        </div>

        {/* Main Grid & Filter Sidebar Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Desktop Sidebar Filter */}
          <div className="hidden lg:block lg:col-span-3 sticky top-28">
            <BookFilters
              categories={categories}
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
            />
          </div>

          {/* Mobile Filter Slide Drawer */}
          <AnimatePresence>
            {isMobileFiltersOpen && (
              <div className="fixed inset-0 z-[90] lg:hidden flex justify-end">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
                />
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="relative z-10 w-full max-w-xs bg-theme-bg border-l border-theme p-6 h-full overflow-y-auto"
                >
                  <BookFilters
                    categories={categories}
                    filters={filters}
                    onFilterChange={(f) => {
                      handleFilterChange(f);
                      setIsMobileFiltersOpen(false);
                    }}
                    onReset={() => {
                      handleResetFilters();
                      setIsMobileFiltersOpen(false);
                    }}
                  />
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Books Grid Column */}
          <div className="lg:col-span-9 space-y-6">
            <div className="flex items-center justify-between text-xs text-theme-muted pb-2 border-b border-theme/60">
              <span>Showing <strong>{books.length}</strong> of <strong>{totalBooks}</strong> eBooks</span>
              <span className="font-mono">Page {page} of {totalPages}</span>
            </div>

            <BookGrid
              books={books}
              isLoading={isLoading}
              onResetFilters={handleResetFilters}
            />

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pt-8 flex items-center justify-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-2.5 rounded-xl bg-theme-card border border-theme text-theme-heading hover:bg-blue-600 hover:text-white disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }).map((_, i) => {
                  const pNum = i + 1;
                  return (
                    <button
                      key={pNum}
                      onClick={() => setPage(pNum)}
                      className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                        page === pNum
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-theme-card border border-theme text-theme-heading hover:bg-slate-200 dark:hover:bg-slate-800'
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}

                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="p-2.5 rounded-xl bg-theme-card border border-theme text-theme-heading hover:bg-blue-600 hover:text-white disabled:opacity-40 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function StorePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-theme-bg" />}>
      <StoreContent />
    </Suspense>
  );
}
