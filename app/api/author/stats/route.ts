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

    // Get author application & profile info
    const [user, authorProfile, application] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true, image: true, authorApplicationStatus: true, isAuthor: true },
      }),
      prisma.author.findUnique({
        where: { userId },
        select: { id: true, slug: true, name: true, avatarUrl: true },
      }),
      prisma.authorApplication.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const authorId = authorProfile?.id;

    // Fetch author book submissions & public books
    const [submissions, authorBooks] = await Promise.all([
      prisma.authorBookSubmission.findMany({
        where: { authorUserId: userId, deletedAt: null },
      }),
      authorId
        ? prisma.book.findMany({
            where: { authorId, deletedAt: null, isDeleted: false },
            include: {
              reviews: true,
              wishlists: true,
              purchases: true,
            },
          })
        : Promise.resolve([]),
    ]);

    const totalSubmissions = submissions.length;
    const publishedCount = submissions.filter(s => s.status === 'APPROVED' || s.status === 'PUBLISHED').length + authorBooks.length;
    const draftCount = submissions.filter(s => s.status === 'DRAFT').length;

    // Calculate downloads/purchases, reviews, ratings, wishlists, followers
    let totalDownloads = 0;
    let totalWishlists = 0;
    let totalReviews = 0;
    let ratingSum = 0;

    authorBooks.forEach((book) => {
      totalDownloads += book.purchases.length;
      totalWishlists += book.wishlists.length;
      totalReviews += book.reviews.length;
      book.reviews.forEach((r) => {
        ratingSum += r.rating;
      });
    });

    const averageRating = totalReviews > 0 ? (ratingSum / totalReviews).toFixed(1) : 'N/A';

    // Followers count
    const followersCount = await prisma.follow.count({
      where: { followingId: userId },
    });

    // Reads (estimated page views / progress records)
    const bookIds = authorBooks.map(b => b.id);
    const readsCount = bookIds.length > 0
      ? await prisma.readingProgress.count({
          where: { bookId: { in: bookIds } },
        })
      : 0;

    const applicationStatus = user?.authorApplicationStatus || application?.status || (user?.isAuthor ? 'APPROVED' : 'NONE');

    return NextResponse.json({
      success: true,
      penName: authorProfile?.name || application?.penName || user?.name || 'Author',
      avatarUrl: authorProfile?.avatarUrl || user?.image || null,
      applicationStatus,
      stats: {
        totalBooks: totalSubmissions + authorBooks.length,
        publishedBooks: publishedCount,
        draftBooks: draftCount,
        downloads: totalDownloads,
        reads: readsCount,
        bookmarks: totalWishlists,
        followers: followersCount,
        reviews: totalReviews,
        averageRating,
      },
    });
  } catch (error) {
    console.error('[AUTHOR STATS API ERROR]:', error);
    return NextResponse.json({ error: 'Failed to fetch author stats' }, { status: 500 });
  }
}
