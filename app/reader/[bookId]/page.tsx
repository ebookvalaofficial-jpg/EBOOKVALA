import React from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ReaderShell, { ReaderBookData } from '@/components/reader/ReaderShell';

interface ReaderPageProps {
  params: Promise<{
    bookId: string;
  }>;
}

export default async function ReaderPage({ params }: ReaderPageProps) {
  // 1. Session Auth Check
  const session = await auth();
  const resolvedParams = await params;
  const bookIdOrSlug = resolvedParams.bookId;

  if (!session || !session.user?.email) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/reader/${bookIdOrSlug}`)}`);
  }

  // 2. Fetch User & Book
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    redirect('/login');
  }

  const book = await prisma.book.findFirst({
    where: {
      OR: [{ id: bookIdOrSlug }, { slug: bookIdOrSlug }],
    },
    include: {
      author: true,
      chapters: {
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!book) {
    redirect('/books');
  }

  // 3. ACCESS CONTROL CHECK: Must have a Purchase record OR an active Subscription with 'PRO' plan
  const purchase = await prisma.purchase.findUnique({
    where: {
      userId_bookId: {
        userId: user.id,
        bookId: book.id,
      },
    },
  });

  const subscription = await prisma.subscription.findUnique({
    where: { userId: user.id },
  });

  const isProSubscriber = subscription?.status === 'ACTIVE' && subscription?.plan === 'PRO';
  const isAuthorized = Boolean(purchase || isProSubscriber);

  if (!isAuthorized) {
    // Redirect to book detail page with purchase prompt flag
    redirect(`/books/${book.slug}?unauthorized=true`);
  }

  // 4. Fetch User's Initial Progress, Streak, Bookmarks, and Highlights
  const progress = await prisma.readingProgress.findUnique({
    where: {
      userId_bookId: {
        userId: user.id,
        bookId: book.id,
      },
    },
  });

  const streak = await prisma.readingStreak.findUnique({
    where: { userId: user.id },
  });

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: user.id, bookId: book.id },
    include: { chapter: { select: { id: true, title: true, order: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const highlights = await prisma.highlight.findMany({
    where: { userId: user.id, bookId: book.id },
    include: { chapter: { select: { id: true, title: true, order: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const formattedBook: ReaderBookData = {
    id: book.id,
    slug: book.slug,
    title: book.title,
    coverImageUrl: book.coverImageUrl,
    authorName: book.author?.name || 'Author',
    chapters: book.chapters.map((c) => ({
      id: c.id,
      order: c.order,
      title: c.title,
      content: c.content,
      wordCount: c.wordCount,
    })),
  };

  const formattedBookmarks = bookmarks.map((b) => ({
    id: b.id,
    chapterId: b.chapterId,
    scrollPositionPercent: b.scrollPositionPercent,
    label: b.label,
    chapterTitle: b.chapter?.title || 'Chapter',
    createdAt: b.createdAt.toISOString(),
  }));

  const formattedHighlights = highlights.map((h) => ({
    id: h.id,
    chapterId: h.chapterId,
    selectedText: h.selectedText,
    color: (h.color as any) || 'YELLOW',
    note: h.note,
    chapterTitle: h.chapter?.title || 'Chapter',
    createdAt: h.createdAt.toISOString(),
  }));

  const userPlan = (subscription?.status === 'ACTIVE' ? subscription?.plan : 'FREE') || 'FREE';

  return (
    <ReaderShell
      book={formattedBook}
      userPlan={userPlan}
      initialProgress={
        progress
          ? {
              currentChapterId: progress.currentChapterId || undefined,
              scrollPositionPercent: progress.scrollPositionPercent,
              percentComplete: progress.percentComplete,
            }
          : null
      }
      initialStreak={streak ? { currentStreak: streak.currentStreak } : null}
      initialBookmarks={formattedBookmarks}
      initialHighlights={formattedHighlights}
    />
  );
}
