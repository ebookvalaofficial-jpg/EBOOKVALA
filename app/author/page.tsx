import React from 'react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { DollarSign, BookOpen, ShoppingBag, Star, Plus, ArrowRight } from 'lucide-react';
import EarningsChart from '@/components/author/EarningsChart';
import SubmissionStatusBadge from '@/components/author/SubmissionStatusBadge';

export default async function AuthorOverviewPage() {
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: { email: session?.user?.email! },
    include: { authorProfile: true },
  });

  const authorId = user?.authorProfile?.id;

  // 1. Fetch Author Books
  const books = authorId
    ? await prisma.book.findMany({
        where: { authorId },
        include: { reviews: true },
      })
    : [];

  // 2. Fetch Author Submissions
  const submissions = await prisma.authorBookSubmission.findMany({
    where: { authorUserId: user?.id! },
    orderBy: { updatedAt: 'desc' },
  });

  // 3. Fetch Royalty Ledger Entries
  const royaltyEntries = await prisma.royaltyLedger.findMany({
    where: { authorUserId: user?.id! },
    include: { book: { select: { title: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const totalEarnings = royaltyEntries.reduce((sum, e) => sum + e.royaltyAmount, 0);
  const totalSalesCount = royaltyEntries.length;

  const totalRatingSum = books.reduce((sum, b) => sum + b.rating, 0);
  const avgRating = books.length ? (totalRatingSum / books.length).toFixed(1) : '0.0';

  return (
    <div className="space-y-8 font-inter text-theme-text">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-500/20 glass-card">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-500 font-montserrat">
            Author Command Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-theme-heading font-montserrat">
            Welcome, {user?.authorProfile?.name || user?.name || 'Author'}!
          </h1>
          <p className="text-xs text-theme-muted mt-1">
            Track your book submissions, sales royalties, and publishing performance.
          </p>
        </div>

        <Link
          href="/author/books/new"
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white text-xs font-extrabold shadow-xl hover:scale-105 transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Publish New Book</span>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-3xl bg-theme-card border border-theme glass-card space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-theme-muted">
            <span className="text-xs font-bold">Total Royalty Earned</span>
            <DollarSign className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-theme-heading font-stats">
            ₹{totalEarnings}
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-theme-card border border-theme glass-card space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-theme-muted">
            <span className="text-xs font-bold">Books Published</span>
            <BookOpen className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-theme-heading font-stats">
            {books.length}
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-theme-card border border-theme glass-card space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-theme-muted">
            <span className="text-xs font-bold">Total Copies Sold</span>
            <ShoppingBag className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-theme-heading font-stats">
            {totalSalesCount}
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-theme-card border border-theme glass-card space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-theme-muted">
            <span className="text-xs font-bold">Average Reader Rating</span>
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
          </div>
          <div className="text-2xl font-black text-theme-heading font-stats">
            {avgRating} <span className="text-xs font-normal text-theme-muted">/ 5.0</span>
          </div>
        </div>
      </div>

      {/* Earnings Trend Chart */}
      <div className="p-6 rounded-3xl bg-theme-card border border-theme glass-card space-y-4 shadow-xl">
        <h3 className="text-base font-bold text-theme-heading font-montserrat">Royalty Earnings Trend</h3>
        <EarningsChart entries={royaltyEntries.map((e) => ({ createdAt: e.createdAt.toISOString(), royaltyAmount: e.royaltyAmount }))} />
      </div>

      {/* Recent Submissions */}
      <div className="p-6 rounded-3xl bg-theme-card border border-theme glass-card space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-theme-heading font-montserrat">Recent Book Submissions</h3>
          <Link href="/author/books" className="text-xs font-bold text-amber-500 hover:underline flex items-center gap-1">
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {submissions.length === 0 ? (
          <p className="text-xs text-theme-muted p-4 text-center">No submissions yet. Click &quot;Publish New Book&quot; to get started!</p>
        ) : (
          <div className="space-y-3">
            {submissions.slice(0, 3).map((sub) => (
              <div key={sub.id} className="p-4 rounded-2xl bg-theme-surface/50 border border-theme/60 flex items-center justify-between gap-4 text-xs font-semibold">
                <div>
                  <h4 className="font-bold text-theme-heading text-sm">{sub.title}</h4>
                  <p className="text-theme-muted text-[11px]">Proposed Price: ₹{sub.price}</p>
                </div>
                <SubmissionStatusBadge status={sub.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
