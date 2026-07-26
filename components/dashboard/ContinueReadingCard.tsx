'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BookOpen, ArrowRight, Play } from 'lucide-react';

export interface ContinueReadingBook {
  bookId: string;
  slug: string;
  title: string;
  coverImageUrl: string;
  authorName: string;
  categoryName: string;
  percentComplete: number;
  currentChapterId?: string | null;
  lastReadAt: string;
}

interface ContinueReadingCardProps {
  books: ContinueReadingBook[];
}

export default function ContinueReadingCard({ books }: ContinueReadingCardProps) {
  if (books.length === 0) {
    return (
      <div className="p-8 rounded-3xl bg-theme-card border border-theme glass-card text-center space-y-3">
        <BookOpen className="w-10 h-10 text-theme-muted mx-auto" />
        <h3 className="text-sm font-bold text-theme-heading">No active reading progress yet</h3>
        <p className="text-xs text-theme-muted">Explore your library or store to start reading your first eBook!</p>
        <Link
          href="/dashboard/library"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white brand-gradient-bg shadow-md mt-2"
        >
          Go to Library <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  const mainBook = books[0];

  return (
    <div className="p-6 rounded-3xl bg-theme-card border border-theme glass-card space-y-6 shadow-sm text-theme-text">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary-blue" />
          <h2 className="text-base font-bold text-theme-heading font-montserrat">Continue Reading</h2>
        </div>
        <span className="text-xs font-bold text-blue-500 font-stats">{mainBook.percentComplete}% Complete</span>
      </div>

      {/* Featured Primary Book */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center bg-theme-surface p-4 rounded-2xl border border-theme/60">
        <div className="sm:col-span-4 relative aspect-[3/4] w-28 sm:w-full mx-auto rounded-xl overflow-hidden shadow-md">
          <Image src={mainBook.coverImageUrl} alt={mainBook.title} fill className="object-cover" />
        </div>

        <div className="sm:col-span-8 space-y-3">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-md border border-blue-400/20">
              {mainBook.categoryName}
            </span>
            <h3 className="text-lg font-bold text-theme-heading font-montserrat mt-2 line-clamp-1">
              {mainBook.title}
            </h3>
            <p className="text-xs text-theme-muted font-medium">By {mainBook.authorName}</p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="h-2 w-full rounded-full bg-slate-500/20 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${mainBook.percentComplete}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-theme-muted font-semibold">
              <span>Progress</span>
              <span>{mainBook.percentComplete}%</span>
            </div>
          </div>

          {/* Resume CTA */}
          <Link
            href={`/reader/${mainBook.bookId}`}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-white brand-gradient-bg shadow-md hover:shadow-blue-500/30 flex items-center justify-center gap-2 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Resume Reading</span>
          </Link>
        </div>
      </div>

      {/* Secondary Recent Reads */}
      {books.length > 1 && (
        <div className="space-y-2 pt-2 border-t border-theme/60">
          <span className="text-xs font-bold text-theme-muted uppercase tracking-wider block">Recent Activity</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {books.slice(1).map((b) => (
              <Link
                key={b.bookId}
                href={`/reader/${b.bookId}`}
                className="p-3 rounded-2xl bg-theme-surface border border-theme/40 hover:border-blue-500/40 flex items-center gap-3 transition-all group"
              >
                <div className="relative w-10 h-14 rounded-lg overflow-hidden shrink-0 shadow-xs">
                  <Image src={b.coverImageUrl} alt={b.title} fill className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-theme-heading truncate group-hover:text-primary-blue transition-colors">
                    {b.title}
                  </h4>
                  <p className="text-[11px] text-theme-muted truncate">{b.authorName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="h-1 flex-1 rounded-full bg-slate-500/20 overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${b.percentComplete}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-primary-blue">{b.percentComplete}%</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
