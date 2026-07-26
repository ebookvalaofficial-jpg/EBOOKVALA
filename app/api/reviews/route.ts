import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createReviewSchema } from '@/lib/validations/book';
import { recordActivityFeedItem } from '@/lib/community/activity';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bookId = searchParams.get('bookId');

    if (!bookId) {
      return NextResponse.json({ error: 'bookId parameter is required' }, { status: 400 });
    }

    const reviews = await prisma.review.findMany({
      where: { bookId: bookId },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ reviews });
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized. Please log in to leave a review.' }, { status: 401 });
    }

    const body = await req.json();
    const validated = createReviewSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const book = await prisma.book.findUnique({
      where: { id: validated.bookId },
    });

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    // Upsert review (1 review per user per book)
    const review = await prisma.review.upsert({
      where: {
        userId_bookId: {
          userId: user.id,
          bookId: validated.bookId,
        },
      },
      update: {
        rating: validated.rating,
        comment: validated.comment,
      },
      create: {
        userId: user.id,
        bookId: validated.bookId,
        rating: validated.rating,
        comment: validated.comment,
      },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    // Re-calculate book rating and count
    const aggregate = await prisma.review.aggregate({
      where: { bookId: validated.bookId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const avgRating = Number((aggregate._avg.rating || validated.rating).toFixed(2));
    const count = aggregate._count.rating || 1;

    await prisma.book.update({
      where: { id: validated.bookId },
      data: {
        rating: avgRating,
        reviewCount: count,
      },
    });

    // Auto-fire ActivityFeedItem for Community Feed
    await recordActivityFeedItem({
      userId: user.id,
      type: 'WROTE_REVIEW',
      targetType: 'BOOK',
      targetId: validated.bookId,
      metadata: { bookTitle: book.title, rating: validated.rating, comment: validated.comment },
    });

    return NextResponse.json({
      review,
      message: 'Review submitted successfully',
      updatedBookRating: avgRating,
      updatedReviewCount: count,
    });
  } catch (error: any) {
    console.error('Error posting review:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to submit review' },
      { status: 500 }
    );
  }
}
