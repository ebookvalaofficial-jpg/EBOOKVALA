import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, id: true },
    });

    if (!admin || (admin.role !== 'ADMIN' && admin.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { action, bookIds } = await req.json();

    if (!Array.isArray(bookIds) || bookIds.length === 0) {
      return NextResponse.json({ error: 'No books selected for bulk action' }, { status: 400 });
    }

    if (action === 'DELETE') {
      await prisma.book.updateMany({
        where: { id: { in: bookIds } },
        data: { isDeleted: true, deletedAt: new Date() },
      });
    } else if (action === 'FEATURE') {
      await prisma.book.updateMany({
        where: { id: { in: bookIds } },
        data: { isFeatured: true },
      });
    } else if (action === 'UNFEATURE') {
      await prisma.book.updateMany({
        where: { id: { in: bookIds } },
        data: { isFeatured: false },
      });
    } else {
      return NextResponse.json({ error: 'Invalid action type' }, { status: 400 });
    }

    await prisma.adminActionLog.create({
      data: {
        adminUserId: admin.id,
        action: `BULK_BOOK_${action}`,
        targetType: 'BOOK',
        targetId: `${bookIds.length} books`,
        details: `Bulk ${action} executed on ${bookIds.length} books`,
      },
    });

    return NextResponse.json({ success: true, count: bookIds.length });
  } catch (error) {
    console.error('[BULK BOOK ACTION ERROR]:', error);
    return NextResponse.json({ error: 'Failed to execute bulk action' }, { status: 500 });
  }
}
