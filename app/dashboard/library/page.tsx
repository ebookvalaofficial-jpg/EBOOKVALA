import React from 'react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import LibraryGrid, { LibraryBookItem } from '@/components/dashboard/LibraryGrid';
import { BookOpen } from 'lucide-react';

export default async function LibraryPage() {
  const session = await auth();

  const user = await prisma.user.findUnique({
    where: { email: session!.user!.email! },
  });

  if (!user) return null;

  const purchases = await prisma.purchase.findMany({
    where: { userId: user.id },
    orderBy: { purchasedAt: 'desc' },
    include: {
      book: {
        include: {
          author: { select: { name: true } },
          category: { select: { name: true, slug: true } },
        },
      },
    },
  });

  const progressRecords = await prisma.readingProgress.findMany({
    where: { userId: user.id },
  });

  const progressMap = new Map(progressRecords.map((p) => [p.bookId, p.percentComplete]));

  const libraryBooks: LibraryBookItem[] = purchases.map((p) => ({
    id: p.id,
    bookId: p.book.id,
    slug: p.book.slug,
    title: p.book.title,
    coverImageUrl: p.book.coverImageUrl,
    authorName: p.book.author.name,
    categoryName: p.book.category.name,
    categorySlug: p.book.category.slug,
    purchasedAt: p.purchasedAt.toISOString(),
    percentComplete: Math.round(progressMap.get(p.book.id) || 0),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-theme-heading font-montserrat flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary-blue" />
          <span>My Purchased Library</span>
        </h1>
        <p className="text-xs text-theme-muted">
          Manage all {libraryBooks.length} eBooks in your permanent collection.
        </p>
      </div>

      <LibraryGrid books={libraryBooks} />
    </div>
  );
}
