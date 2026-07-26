import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdminAuth, logAdminAction } from '@/lib/admin-auth';
import { adminBookSchema } from '@/lib/validations/admin';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { errorResponse } = await checkAdminAuth();
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;
    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        author: true,
        category: true,
        chapters: { orderBy: { order: 'asc' } },
        _count: { select: { purchases: true, reviews: true } },
      },
    });

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    return NextResponse.json({ book });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch book' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { adminUser, errorResponse } = await checkAdminAuth();
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;
    const body = await req.json();
    const validated = adminBookSchema.parse(body);

    const { chapters, ...bookData } = validated;

    const existing = await prisma.book.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    // Check slug uniqueness if changed
    if (bookData.slug !== existing.slug) {
      const slugCheck = await prisma.book.findUnique({ where: { slug: bookData.slug } });
      if (slugCheck) {
        return NextResponse.json({ error: 'Book slug already taken by another book' }, { status: 400 });
      }
    }

    // Replace chapters cleanly if provided
    if (chapters) {
      await prisma.chapter.deleteMany({ where: { bookId: id } });
      await prisma.chapter.createMany({
        data: chapters.map((ch, idx) => ({
          bookId: id,
          order: ch.order || idx + 1,
          title: ch.title,
          content: ch.content,
          wordCount: ch.content.split(/\s+/).length,
        })),
      });
    }

    const updatedBook = await prisma.book.update({
      where: { id },
      data: bookData,
      include: {
        author: true,
        category: true,
        chapters: { orderBy: { order: 'asc' } },
      },
    });

    await logAdminAction({
      adminUserId: adminUser!.id,
      action: 'BOOK_UPDATED',
      targetType: 'Book',
      targetId: id,
      details: { title: updatedBook.title, price: updatedBook.price },
    });

    return NextResponse.json({ book: updatedBook });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update book' }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { adminUser, errorResponse } = await checkAdminAuth();
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;
    const book = await prisma.book.findUnique({
      where: { id },
      include: { _count: { select: { purchases: true } } },
    });

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    // SAFE SOFT DELETE STRATEGY:
    // If a book has existing purchases, we soft delete it (`isDeleted: true`)
    // to preserve existing owners' library and web reader access.
    // If it has 0 purchases, we perform a clean hard deletion.
    let actionType = 'BOOK_DELETED';

    if (book._count.purchases > 0) {
      await prisma.book.update({
        where: { id },
        data: { isDeleted: true },
      });
      actionType = 'BOOK_SOFT_DELETED';
    } else {
      await prisma.book.delete({ where: { id } });

      // Decrement counts
      await prisma.author.update({
        where: { id: book.authorId },
        data: { booksCount: { decrement: 1 } },
      }).catch(() => {});

      await prisma.category.update({
        where: { id: book.categoryId },
        data: { bookCount: { decrement: 1 } },
      }).catch(() => {});
    }

    await logAdminAction({
      adminUserId: adminUser!.id,
      action: actionType,
      targetType: 'Book',
      targetId: id,
      details: { title: book.title, purchasesCount: book._count.purchases },
    });

    return NextResponse.json({
      success: true,
      message:
        book._count.purchases > 0
          ? 'Book soft-deleted to preserve existing library purchases'
          : 'Book permanently deleted',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete book' }, { status: 500 });
  }
}
