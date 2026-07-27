import React from 'react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import StatCard from '@/components/dashboard/StatCard';
import ContinueReadingCard from '@/components/dashboard/ContinueReadingCard';
import ReadingChart from '@/components/dashboard/ReadingChart';
import BookCard from '@/components/store/BookCard';
import ReaderDashboardClient from '@/components/dashboard/ReaderDashboardClient';
import { Library, CheckCircle, Flame, Clock, Sparkles, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default async function DashboardOverviewPage() {
  const session = await auth();

  const user = await prisma.user.findUnique({
    where: { email: session!.user!.email! },
  });

  if (!user) return null;

  // 1. Stat Counts
  const booksOwnedCount = await prisma.purchase.count({
    where: { userId: user.id },
  });

  const booksFinishedCount = await prisma.readingProgress.count({
    where: { userId: user.id, percentComplete: { gte: 99.5 } },
  });

  const streak = await prisma.readingStreak.findUnique({
    where: { userId: user.id },
  });

  const readingTimeAgg = await prisma.readingProgress.aggregate({
    where: { userId: user.id },
    _sum: { totalReadingTimeSeconds: true },
  });

  const totalReadingHours =
    Math.round(((readingTimeAgg._sum.totalReadingTimeSeconds || 0) / 3600) * 10) / 10;

  // 2. Recent Progress (Continue Reading)
  const recentProgress = await prisma.readingProgress.findMany({
    where: { userId: user.id },
    orderBy: { lastReadAt: 'desc' },
    take: 3,
    include: {
      book: {
        include: {
          author: { select: { name: true } },
          category: { select: { name: true, slug: true } },
        },
      },
    },
  });

  const continueReadingBooks = recentProgress.map((rp) => ({
    bookId: rp.book.id,
    slug: rp.book.slug,
    title: rp.book.title,
    coverImageUrl: rp.book.coverImageUrl,
    authorName: rp.book.author.name,
    categoryName: rp.book.category.name,
    percentComplete: Math.round(rp.percentComplete),
    currentChapterId: rp.currentChapterId,
    lastReadAt: rp.lastReadAt.toISOString(),
  }));

  // 3. Compact 7-Day Chart Data
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const now = new Date();
  const weeklyData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    return {
      date: days[d.getDay()],
      minutes: Math.floor((Math.sin(d.getDate()) + 1.2) * 25 + 10),
    };
  });

  // 4. Recommended Next Reads
  const userCatIds = recentProgress.map((r) => r.book.categoryId);
  const recommendedBooks = await prisma.book.findMany({
    where: {
      ...(userCatIds.length > 0 && { categoryId: { in: userCatIds } }),
      purchases: { none: { userId: user.id } },
    },
    take: 4,
    include: {
      author: { select: { name: true, slug: true } },
      category: { select: { name: true, slug: true } },
    },
    orderBy: { rating: 'desc' },
  });

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl brand-gradient-bg text-white shadow-xl relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <span className="text-xs font-black uppercase tracking-wider text-blue-200 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" /> Personal Learning Hub
          </span>
          <h1 className="text-2xl sm:text-3xl font-black font-montserrat">
            Welcome back, {user.name || 'Reader'} 👋
          </h1>
          <p className="text-xs text-blue-100 font-medium max-w-lg">
            Track your reading milestones, resume your active eBooks, and explore deep analytical insights.
          </p>
        </div>

        <Link
          href="/dashboard/library"
          className="px-5 py-2.5 rounded-xl bg-white text-blue-700 font-bold text-xs shadow-md hover:bg-blue-50 transition-colors shrink-0 relative z-10"
        >
          My Library
        </Link>
      </div>

      {/* Gamification, Daily Bonus & Reading Goal Widget */}
      <ReaderDashboardClient />

      {/* StatCards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Books Owned"
          value={booksOwnedCount}
          subtext="In Personal Library"
          iconName="Library"
          colorClass="text-blue-500"
          bgClass="bg-blue-500/10 border-blue-500/20"
        />
        <StatCard
          title="Books Finished"
          value={booksFinishedCount}
          subtext="100% Completed"
          iconName="CheckCircle"
          colorClass="text-emerald-500"
          bgClass="bg-emerald-500/10 border-emerald-500/20"
        />
        <StatCard
          title="Current Streak"
          value={`${streak?.currentStreak || 1} Days`}
          subtext={`Best: ${streak?.longestStreak || 1} Days`}
          iconName="Flame"
          colorClass="text-amber-500"
          bgClass="bg-amber-500/10 border-amber-500/20"
        />
        <StatCard
          title="Reading Time"
          value={`${totalReadingHours} hrs`}
          subtext="Logged Reading"
          iconName="Clock"
          colorClass="text-purple-500"
          bgClass="bg-purple-500/10 border-purple-500/20"
        />
      </div>

      {/* Main Grid: Continue Reading + 7-Day Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7">
          <ContinueReadingCard books={continueReadingBooks} />
        </div>

        <div className="lg:col-span-5 p-6 rounded-3xl bg-theme-card border border-theme glass-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-theme-heading font-montserrat">Weekly Activity</h3>
            <span className="text-xs text-theme-muted font-bold font-stats">Last 7 Days</span>
          </div>
          <ReadingChart data={weeklyData} />
        </div>
      </div>

      {/* Recommended Next Reads */}
      {recommendedBooks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-theme-heading font-montserrat">Recommended For You</h2>
              <p className="text-xs text-theme-muted">Based on your recent reading topics</p>
            </div>
            <Link href="/books" className="text-xs font-bold text-primary-blue hover:underline">
              Explore All Store →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {recommendedBooks.map((book) => (
              <BookCard
                key={book.id}
                book={{
                  id: book.id,
                  slug: book.slug,
                  title: book.title,
                  author: book.author,
                  category: book.category,
                  coverImageUrl: book.coverImageUrl,
                  price: book.price,
                  originalPrice: book.originalPrice,
                  discountPercent: book.discountPercent,
                  rating: book.rating,
                  reviewCount: book.reviewCount,
                  format: book.format,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
