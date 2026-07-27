import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch user purchases, wishlist, favorites, archived, history, collections
    const [purchases, wishlist, favorites, archived, readingHistory, collections] = await Promise.all([
      prisma.purchase.findMany({
        where: { userId },
        include: {
          book: {
            include: { author: true, category: true },
          },
        },
        orderBy: { purchasedAt: 'desc' },
      }),
      prisma.wishlist.findMany({
        where: { userId },
        include: {
          book: {
            include: { author: true, category: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.favorite.findMany({
        where: { userId },
        include: {
          book: {
            include: { author: true, category: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.archivedBook.findMany({
        where: { userId },
        include: {
          book: {
            include: { author: true, category: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.readingProgress.findMany({
        where: { userId },
        include: {
          book: {
            include: { author: true, category: true },
          },
        },
        orderBy: { lastReadAt: 'desc' },
      }),
      prisma.collection.findMany({
        where: { userId },
        include: {
          books: {
            include: { book: { include: { author: true, category: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const archivedBookIds = new Set(archived.map(a => a.bookId));

    // Purchased paid books (not archived)
    const purchasedBooks = purchases
      .filter(p => p.book.price > 0 && !archivedBookIds.has(p.bookId))
      .map(p => p.book);

    // Free books (purchased or price 0, not archived)
    const freeBooks = purchases
      .filter(p => p.book.price === 0 && !archivedBookIds.has(p.bookId))
      .map(p => p.book);

    const wishlistBooks = wishlist.map(w => w.book);
    const favoriteBooks = favorites.map(f => f.book);
    const archivedBooksList = archived.map(a => a.book);
    const historyBooks = readingHistory.map(h => ({
      ...h.book,
      percentComplete: h.percentComplete,
      lastReadAt: h.lastReadAt,
    }));

    return NextResponse.json({
      success: true,
      purchasedBooks,
      freeBooks,
      wishlistBooks,
      favoriteBooks,
      archivedBooks: archivedBooksList,
      historyBooks,
      collections,
    });
  } catch (error) {
    console.error('[LIBRARY GET API ERROR]:', error);
    return NextResponse.json({ error: 'Failed to fetch library' }, { status: 500 });
  }
}
