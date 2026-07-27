import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST: Soft-delete or Restore a book / submission
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { action } = await req.json(); // 'soft-delete' | 'restore' | 'permanent-delete'

    const userId = session.user.id;

    // Check submission or book belonging to this author
    const submission = await prisma.authorBookSubmission.findFirst({
      where: { id, authorUserId: userId },
    });

    const authorProfile = await prisma.author.findUnique({ where: { userId } });
    const book = authorProfile
      ? await prisma.book.findFirst({ where: { id, authorId: authorProfile.id } })
      : null;

    if (!submission && !book) {
      return NextResponse.json({ error: 'Book or submission not found' }, { status: 404 });
    }

    if (action === 'soft-delete') {
      const now = new Date();
      if (submission) {
        await prisma.authorBookSubmission.update({
          where: { id: submission.id },
          data: { deletedAt: now },
        });
      }
      if (book) {
        await prisma.book.update({
          where: { id: book.id },
          data: { isDeleted: true, deletedAt: now },
        });
      }
      return NextResponse.json({ success: true, message: 'Moved book to Recycle Bin' });
    } else if (action === 'restore') {
      if (submission) {
        await prisma.authorBookSubmission.update({
          where: { id: submission.id },
          data: { deletedAt: null },
        });
      }
      if (book) {
        await prisma.book.update({
          where: { id: book.id },
          data: { isDeleted: false, deletedAt: null },
        });
      }
      return NextResponse.json({ success: true, message: 'Restored book from Recycle Bin' });
    } else if (action === 'permanent-delete') {
      // Hard delete only if confirmed
      if (submission) {
        await prisma.authorBookSubmission.delete({ where: { id: submission.id } });
      }
      if (book) {
        // Soft-deleted books in Recycle Bin can be permanently deleted.
        // Existing purchases remain intact because OrderItems store title & price.
        await prisma.book.delete({ where: { id: book.id } });
      }
      return NextResponse.json({ success: true, message: 'Permanently deleted book' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[AUTHOR BOOK TRASH API ERROR]:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// GET: Fetch all soft-deleted items in Recycle Bin for this author
export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const authorProfile = await prisma.author.findUnique({ where: { userId } });

    const [deletedSubmissions, deletedBooks] = await Promise.all([
      prisma.authorBookSubmission.findMany({
        where: { authorUserId: userId, deletedAt: { not: null } },
        include: { category: true },
        orderBy: { updatedAt: 'desc' },
      }),
      authorProfile
        ? prisma.book.findMany({
            where: { authorId: authorProfile.id, deletedAt: { not: null } },
            include: { category: true },
            orderBy: { updatedAt: 'desc' },
          })
        : Promise.resolve([]),
    ]);

    return NextResponse.json({
      success: true,
      deletedSubmissions,
      deletedBooks,
    });
  } catch (error) {
    console.error('[RECYCLE BIN GET API ERROR]:', error);
    return NextResponse.json({ error: 'Failed to fetch recycle bin items' }, { status: 500 });
  }
}
