import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const book = await prisma.book.findFirst({
      where: {
        OR: [{ id: id }, { slug: id }],
      },
      include: {
        author: true,
        category: true,
        reviews: {
          include: {
            user: {
              select: { id: true, name: true, image: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    // Related books from same category excluding current book
    const relatedBooks = await prisma.book.findMany({
      where: {
        categoryId: book.categoryId,
        id: { not: book.id },
      },
      include: {
        author: { select: { name: true, slug: true } },
        category: { select: { name: true, slug: true } },
      },
      take: 6,
      orderBy: { rating: 'desc' },
    });

    return NextResponse.json({ book, relatedBooks });
  } catch (error: any) {
    console.error('Error fetching book detail:', error);
    return NextResponse.json(
      { error: 'Failed to fetch book detail' },
      { status: 500 }
    );
  }
}
