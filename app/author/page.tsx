'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen, CheckCircle2, Clock, Download, Eye, Bookmark, Users,
  Star, PlusCircle, Trash2, ArrowRight, ShieldCheck, AlertTriangle, Loader2
} from 'lucide-react';
import AuthorSidebar from '@/components/author/AuthorSidebar';

interface AuthorData {
  penName: string;
  avatarUrl: string | null;
  applicationStatus: string;
  stats: {
    totalBooks: number;
    publishedBooks: number;
    draftBooks: number;
    downloads: number;
    reads: number;
    bookmarks: number;
    followers: number;
    reviews: number;
    averageRating: string;
  };
}

export default function AuthorDashboardHome() {
  const [data, setData] = useState<AuthorData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/author/stats');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error('Failed to load author stats:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const stats = data?.stats || {
    totalBooks: 0,
    publishedBooks: 0,
    draftBooks: 0,
    downloads: 0,
    reads: 0,
    bookmarks: 0,
    followers: 0,
    reviews: 0,
    averageRating: 'N/A',
  };

  const isVerified = data?.applicationStatus === 'APPROVED';
  const isPending = data?.applicationStatus === 'PENDING';

  return (
    <div className="min-h-screen bg-theme-bg text-theme-body flex flex-col md:flex-row">
      <AuthorSidebar
        penName={data?.penName || 'Author'}
        avatarUrl={data?.avatarUrl || undefined}
        applicationStatus={data?.applicationStatus || 'APPROVED'}
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-theme-card border border-theme glass-card shadow-lg">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-primary-blue bg-blue-500/10 px-3 py-1 rounded-full">
                Author Portal
              </span>
              {isVerified && (
                <span className="text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified Author
                </span>
              )}
              {isPending && (
                <span className="text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 animate-spin" /> Verification Pending Review
                </span>
              )}
              {!isVerified && !isPending && (
                <span className="text-xs font-bold bg-slate-500/20 text-slate-400 border border-slate-500/30 px-3 py-1 rounded-full flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Application Incomplete
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-theme-heading font-montserrat">
              Welcome back, {data?.penName || 'Author'}!
            </h1>
            <p className="text-xs sm:text-sm text-theme-muted mt-1">
              Manage your publications, monitor real-time sales, and reach thousands of readers across EbookVala.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/author/books/new"
              className="px-5 py-3 rounded-2xl text-xs font-bold text-white brand-gradient-bg shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 flex items-center gap-2 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Publish New Book</span>
            </Link>
          </div>
        </div>

        {/* 9 Live Database Stat Cards */}
        {loading ? (
          <div className="py-12 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary-blue" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6">
            {/* 1. Total Books */}
            <div className="p-5 rounded-3xl bg-theme-card border border-theme glass-card shadow-sm hover:border-blue-500/30 transition-all space-y-2">
              <div className="flex items-center justify-between text-theme-muted">
                <span className="text-xs font-semibold">Total Books</span>
                <div className="p-2 rounded-xl bg-blue-500/10 text-primary-blue">
                  <BookOpen className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-theme-heading font-stats">
                {stats.totalBooks}
              </p>
              <span className="text-[10px] text-theme-muted">Submissions & Published</span>
            </div>

            {/* 2. Published Books */}
            <div className="p-5 rounded-3xl bg-theme-card border border-theme glass-card shadow-sm hover:border-emerald-500/30 transition-all space-y-2">
              <div className="flex items-center justify-between text-theme-muted">
                <span className="text-xs font-semibold">Published</span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-theme-heading font-stats text-emerald-400">
                {stats.publishedBooks}
              </p>
              <span className="text-[10px] text-theme-muted">Live in Public Store</span>
            </div>

            {/* 3. Draft Books */}
            <div className="p-5 rounded-3xl bg-theme-card border border-theme glass-card shadow-sm hover:border-amber-500/30 transition-all space-y-2">
              <div className="flex items-center justify-between text-theme-muted">
                <span className="text-xs font-semibold">Draft Books</span>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-theme-heading font-stats text-amber-400">
                {stats.draftBooks}
              </p>
              <span className="text-[10px] text-theme-muted">Work in Progress</span>
            </div>

            {/* 4. Downloads / Purchases */}
            <div className="p-5 rounded-3xl bg-theme-card border border-theme glass-card shadow-sm hover:border-purple-500/30 transition-all space-y-2">
              <div className="flex items-center justify-between text-theme-muted">
                <span className="text-xs font-semibold">Downloads</span>
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                  <Download className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-theme-heading font-stats">
                {stats.downloads}
              </p>
              <span className="text-[10px] text-theme-muted">Reader purchases</span>
            </div>

            {/* 5. Reads (Page Views) */}
            <div className="p-5 rounded-3xl bg-theme-card border border-theme glass-card shadow-sm hover:border-blue-500/30 transition-all space-y-2">
              <div className="flex items-center justify-between text-theme-muted">
                <span className="text-xs font-semibold">Reads (Views)</span>
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                  <Eye className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-theme-heading font-stats">
                {stats.reads}
              </p>
              <span className="text-[10px] text-theme-muted">Active reader sessions</span>
            </div>

            {/* 6. Bookmarks / Wishlists */}
            <div className="p-5 rounded-3xl bg-theme-card border border-theme glass-card shadow-sm hover:border-rose-500/30 transition-all space-y-2">
              <div className="flex items-center justify-between text-theme-muted">
                <span className="text-xs font-semibold">Bookmarks</span>
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                  <Bookmark className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-theme-heading font-stats">
                {stats.bookmarks}
              </p>
              <span className="text-[10px] text-theme-muted">Saved to wishlists</span>
            </div>

            {/* 7. Followers */}
            <div className="p-5 rounded-3xl bg-theme-card border border-theme glass-card shadow-sm hover:border-indigo-500/30 transition-all space-y-2">
              <div className="flex items-center justify-between text-theme-muted">
                <span className="text-xs font-semibold">Followers</span>
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-theme-heading font-stats">
                {stats.followers}
              </p>
              <span className="text-[10px] text-theme-muted">Community followers</span>
            </div>

            {/* 8. Total Reviews */}
            <div className="p-5 rounded-3xl bg-theme-card border border-theme glass-card shadow-sm hover:border-amber-500/30 transition-all space-y-2">
              <div className="flex items-center justify-between text-theme-muted">
                <span className="text-xs font-semibold">Reviews</span>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <Star className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-theme-heading font-stats">
                {stats.reviews}
              </p>
              <span className="text-[10px] text-theme-muted">Reader feedback ratings</span>
            </div>

            {/* 9. Average Rating */}
            <div className="p-5 rounded-3xl bg-theme-card border border-theme glass-card shadow-sm hover:border-amber-400/30 transition-all space-y-2">
              <div className="flex items-center justify-between text-theme-muted">
                <span className="text-xs font-semibold">Avg Rating</span>
                <div className="p-2 rounded-xl bg-amber-400/15 text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-amber-400 font-stats">
                {stats.averageRating}
              </p>
              <span className="text-[10px] text-theme-muted">Out of 5 stars</span>
            </div>
          </div>
        )}

        {/* Quick Management Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/author/books"
            className="p-6 rounded-3xl bg-theme-card border border-theme glass-card shadow-md hover:border-blue-500/40 transition-all group space-y-3"
          >
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-primary-blue flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-theme-heading font-montserrat flex items-center justify-between">
                <span>My Submissions & Books</span>
                <ArrowRight className="w-4 h-4 text-theme-muted group-hover:text-primary-blue group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-xs text-theme-muted mt-1 leading-relaxed">
                Manage your submitted manuscripts, track approval status, and update book descriptions.
              </p>
            </div>
          </Link>

          <Link
            href="/author/recycle-bin"
            className="p-6 rounded-3xl bg-theme-card border border-theme glass-card shadow-md hover:border-rose-500/40 transition-all group space-y-3"
          >
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-theme-heading font-montserrat flex items-center justify-between">
                <span>Recycle Bin</span>
                <ArrowRight className="w-4 h-4 text-theme-muted group-hover:text-rose-400 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-xs text-theme-muted mt-1 leading-relaxed">
                Restore soft-deleted book submissions or permanently purge items older than 30 days.
              </p>
            </div>
          </Link>

          <Link
            href="/author/earnings"
            className="p-6 rounded-3xl bg-theme-card border border-theme glass-card shadow-md hover:border-emerald-500/40 transition-all group space-y-3"
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-theme-heading font-montserrat flex items-center justify-between">
                <span>Analytics & Payouts</span>
                <ArrowRight className="w-4 h-4 text-theme-muted group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-xs text-theme-muted mt-1 leading-relaxed">
                Track conversion rates, review monthly royalties, and submit withdrawal requests.
              </p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
