'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LayoutGrid, List, Search, Filter, BookOpen, CheckCircle, Play, Sparkles } from 'lucide-react';

export interface LibraryBookItem {
  id: string;
  bookId: string;
  slug: string;
  title: string;
  coverImageUrl: string;
  authorName: string;
  categoryName: string;
  categorySlug: string;
  purchasedAt: string;
  percentComplete: number;
  lastReadAt?: string | null;
}

interface LibraryGridProps {
  books: LibraryBookItem[];
}

export default function LibraryGrid({ books }: LibraryGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProgressFilter, setSelectedProgressFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'progress' | 'title'>('recent');

  // Categories extraction
  const categories = useMemo(() => {
    const set = new Set<string>();
    books.forEach((b) => set.add(b.categoryName));
    return Array.from(set);
  }, [books]);

  // Filter & Sort
  const filteredBooks = useMemo(() => {
    return books
      .filter((b) => {
        const matchesSearch =
          b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.authorName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || b.categoryName === selectedCategory;
        const matchesProgress =
          selectedProgressFilter === 'all' ||
          (selectedProgressFilter === 'unread' && b.percentComplete === 0) ||
          (selectedProgressFilter === 'in-progress' && b.percentComplete > 0 && b.percentComplete < 99.5) ||
          (selectedProgressFilter === 'finished' && b.percentComplete >= 99.5);

        return matchesSearch && matchesCategory && matchesProgress;
      })
      .sort((a, b) => {
        if (sortBy === 'recent') {
          return new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime();
        } else if (sortBy === 'progress') {
          return b.percentComplete - a.percentComplete;
        } else {
          return a.title.localeCompare(b.title);
        }
      });
  }, [books, searchQuery, selectedCategory, selectedProgressFilter, sortBy]);

  return (
    <div className="space-y-6 text-theme-text">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-3xl bg-theme-card border border-theme glass-card">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your library..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-theme-surface border border-theme/60 text-xs font-semibold text-theme-heading placeholder:text-theme-muted focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Filters & Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-2xl bg-theme-surface border border-theme/60 text-xs font-bold text-theme-heading focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Progress Filter */}
          <select
            value={selectedProgressFilter}
            onChange={(e) => setSelectedProgressFilter(e.target.value)}
            className="px-3 py-2 rounded-2xl bg-theme-surface border border-theme/60 text-xs font-bold text-theme-heading focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="in-progress">In Progress</option>
            <option value="finished">Finished</option>
            <option value="unread">Unread</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 rounded-2xl bg-theme-surface border border-theme/60 text-xs font-bold text-theme-heading focus:outline-none"
          >
            <option value="recent">Recently Purchased</option>
            <option value="progress">Highest Progress</option>
            <option value="title">Title A-Z</option>
          </select>

          {/* Grid / List Toggle */}
          <div className="flex items-center gap-1 bg-theme-surface p-1 rounded-2xl border border-theme/60">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-xl transition-all ${
                viewMode === 'grid' ? 'bg-blue-600 text-white shadow-xs' : 'text-theme-muted hover:text-theme-heading'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-xl transition-all ${
                viewMode === 'list' ? 'bg-blue-600 text-white shadow-xs' : 'text-theme-muted hover:text-theme-heading'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredBooks.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-theme-card border border-theme glass-card space-y-3">
          <BookOpen className="w-12 h-12 text-theme-muted mx-auto" />
          <h3 className="text-base font-bold text-theme-heading">No books match your criteria</h3>
          <p className="text-xs text-theme-muted">Try adjusting your filters or search terms.</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid Layout */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredBooks.map((b) => (
            <div
              key={b.id}
              className="group p-4 rounded-3xl bg-theme-card border border-theme glass-card hover:border-blue-500/40 transition-all flex flex-col justify-between shadow-xs"
            >
              <div className="space-y-3">
                <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden shadow-md">
                  <Image src={b.coverImageUrl} alt={b.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  {b.percentComplete >= 99.5 && (
                    <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase flex items-center gap-1 shadow-md">
                      <CheckCircle className="w-3 h-3" /> Completed
                    </div>
                  )}
                </div>

                <div>
                  <span className="text-[10px] font-extrabold uppercase text-blue-400 block">{b.categoryName}</span>
                  <h3 className="text-sm font-bold text-theme-heading font-montserrat truncate mt-0.5">{b.title}</h3>
                  <p className="text-xs text-theme-muted truncate">{b.authorName}</p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="h-1.5 w-full rounded-full bg-slate-500/20 overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${b.percentComplete}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-semibold text-theme-muted">
                    <span>{b.percentComplete}% read</span>
                    <span>Purchased {new Date(b.purchasedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <Link
                href={`/reader/${b.bookId}`}
                className="mt-4 w-full py-2.5 rounded-xl text-xs font-bold text-white brand-gradient-bg shadow-sm hover:shadow-blue-500/25 flex items-center justify-center gap-1.5 transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{b.percentComplete > 0 ? 'Continue Reading' : 'Start Reading'}</span>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        /* List Layout */
        <div className="space-y-3">
          {filteredBooks.map((b) => (
            <div
              key={b.id}
              className="p-4 rounded-3xl bg-theme-card border border-theme glass-card hover:border-blue-500/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="relative w-14 h-20 rounded-xl overflow-hidden shrink-0 shadow-md">
                  <Image src={b.coverImageUrl} alt={b.title} fill className="object-cover" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-extrabold uppercase text-blue-400 block">{b.categoryName}</span>
                  <h3 className="text-sm font-bold text-theme-heading font-montserrat truncate">{b.title}</h3>
                  <p className="text-xs text-theme-muted truncate">{b.authorName}</p>
                  <div className="flex items-center gap-2 mt-2 w-48">
                    <div className="h-1.5 flex-1 rounded-full bg-slate-500/20 overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${b.percentComplete}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-primary-blue">{b.percentComplete}%</span>
                  </div>
                </div>
              </div>

              <Link
                href={`/reader/${b.bookId}`}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white brand-gradient-bg shadow-sm hover:shadow-blue-500/25 flex items-center gap-1.5 shrink-0 transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{b.percentComplete > 0 ? 'Continue Reading' : 'Start Reading'}</span>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
