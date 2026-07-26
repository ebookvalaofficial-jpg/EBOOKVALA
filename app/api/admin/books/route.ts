import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdminAuth, logAdminAction } from '@/lib/admin-auth';
import { adminBookSchema } from '@/lib/validations/admin';

export async function GET(req: Request) {
  const { errorResponse } = await checkAdminAuth();
  if (errorResponse) return errorResponse;

  try {
    const books = await prisma.book.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { name: true } },
        category: { select: { name: true } },
        chapters: { select: { id: true, order: true, title: true } },
        _count: { select: { purchases: true, reviews: true } },
      },
    });

    return NextResponse.json({ books });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch books' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { adminUser, errorResponse } = await checkAdminAuth();
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const validated = adminBookSchema.parse(body);

    const { chapters, ...bookData } = validated;

    // Check slug uniqueness
    const existing = await prisma.book.findUnique({ where: { slug: bookData.slug } });
    if (existing) {
      return NextResponse.json({ error: 'Book slug already exists' }, { status: 400 });
    }

    const newBook = await prisma.book.create({
      data: {
        ...bookData,
        chapters: chapters
          ? {
              create: chapters.map((ch, idx) => ({
                order: ch.order || idx + 1,
                title: ch.title,
                content: ch.content,
                wordCount: ch.content.split(/\s+/).length,
              })),
            }
          : undefined,
      },
      include: {
        author: true,
        category: true,
        chapters: true,
      },
    });

    // Update Author & Category books count
    await prisma.author.update({
      where: { id: bookData.authorId },
      data: { booksCount: { increment: 1 } },
    });

    await prisma.category.update({
      where: { id: bookData.categoryId },
      data: { bookCount: { increment: 1 } },
    });

    // Log admin action
    await logAdminAction({
      adminUserId: adminUser!.id,
      action: 'BOOK_CREATED',
      targetType: 'Book',
      targetId: newBook.id,
      details: { title: newBook.title, price: newBook.price },
    });

    return NextResponse.json({ book: newBook }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create book' }, { status: 400 });
  }
}
