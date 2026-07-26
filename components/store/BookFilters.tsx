'use client';

import React from 'react';
import { Filter, RotateCcw, SlidersHorizontal, Star } from 'lucide-react';

export interface FilterState {
  category: string[];
  priceMin: number | undefined;
  priceMax: number | undefined;
  ratingMin: number | undefined;
  format: string;
  sort: string;
}

interface CategoryOption {
  id: string;
  slug: string;
  name: string;
  bookCount?: number;
}

interface BookFiltersProps {
  categories: CategoryOption[];
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onReset: () => void;
}

const formats = ['All Formats', 'EPUB', 'PDF', 'Audiobook'];
const sortOptions = [
  { label: 'Most Popular', value: 'popular' },
  { label: 'Newest Arrivals', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Highest Rated', value: 'rating_desc' },
];

export default function BookFilters({
  categories,
  filters,
  onFilterChange,
  onReset,
}: BookFiltersProps) {
  const toggleCategory = (slug: string) => {
    let updated: string[];
    if (filters.category.includes(slug)) {
      updated = filters.category.filter((c) => c !== slug);
    } else {
      updated = [...filters.category, slug];
    }
    onFilterChange({ ...filters, category: updated });
  };

  return (
    <div className="space-y-6 bg-theme-card border border-theme glass-card p-6 rounded-3xl shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-theme/60">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-primary-blue" />
          <h3 className="text-base font-bold text-theme-heading font-montserrat">Filter Books</h3>
        </div>

        <button
          onClick={onReset}
          className="text-xs font-semibold text-theme-muted hover:text-primary-blue flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>

      {/* Sort By Mobile/Desktop */}
      <div className="space-y-2">
        <label className="text-xs font-extrabold uppercase tracking-wider text-theme-muted block">
          Sort By
        </label>
        <select
          value={filters.sort}
          onChange={(e) => onFilterChange({ ...filters, sort: e.target.value })}
          className="w-full px-3.5 py-2.5 rounded-xl bg-theme-surface border border-theme text-xs font-medium text-theme-heading focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Categories Multi-Select */}
      <div className="space-y-2.5">
        <label className="text-xs font-extrabold uppercase tracking-wider text-theme-muted block">
          Categories
        </label>
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          {categories.map((cat) => {
            const isSelected = filters.category.includes(cat.slug);
            return (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.slug)}
                className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-blue-500/10 text-primary-blue border border-blue-500/30'
                    : 'text-theme-body hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <span>{cat.name}</span>
                {cat.bookCount !== undefined && (
                  <span className="text-[10px] text-theme-muted bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                    {cat.bookCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="space-y-2">
        <label className="text-xs font-extrabold uppercase tracking-wider text-theme-muted block">
          Price Range (₹)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min ₹"
            value={filters.priceMin ?? ''}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                priceMin: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="w-full px-3 py-2 rounded-xl bg-theme-surface border border-theme text-xs text-theme-heading placeholder:text-theme-muted focus:outline-none focus:border-blue-500"
          />
          <input
            type="number"
            placeholder="Max ₹"
            value={filters.priceMax ?? ''}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                priceMax: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="w-full px-3 py-2 rounded-xl bg-theme-surface border border-theme text-xs text-theme-heading placeholder:text-theme-muted focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Minimum Rating */}
      <div className="space-y-2">
        <label className="text-xs font-extrabold uppercase tracking-wider text-theme-muted block">
          Minimum Rating
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {[undefined, 4.0, 4.5, 4.8].map((rating) => {
            const isSelected = filters.ratingMin === rating;
            return (
              <button
                key={rating ?? 'all'}
                onClick={() => onFilterChange({ ...filters, ratingMin: rating })}
                className={`py-1.5 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-theme-surface border border-theme text-theme-body hover:border-amber-400/50'
                }`}
              >
                {rating ? (
                  <>
                    <span>{rating}</span>
                    <Star className="w-3 h-3 fill-current" />
                  </>
                ) : (
                  'All'
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Format Filter */}
      <div className="space-y-2">
        <label className="text-xs font-extrabold uppercase tracking-wider text-theme-muted block">
          Format
        </label>
        <div className="flex flex-wrap gap-1.5">
          {formats.map((fmt) => {
            const fmtValue = fmt === 'All Formats' ? '' : fmt;
            const isSelected = filters.format === fmtValue;
            return (
              <button
                key={fmt}
                onClick={() => onFilterChange({ ...filters, format: fmtValue })}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-theme-surface border border-theme text-theme-body hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                {fmt}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
