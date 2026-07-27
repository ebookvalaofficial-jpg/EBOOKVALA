import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { bookId } = await req.json();

    const existing = await prisma.archivedBook.findUnique({
      where: { userId_bookId: { userId, bookId } },
    });

    if (existing) {
      await prisma.archivedBook.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ success: true, isArchived: false, message: 'Unarchived book' });
    } else {
      await prisma.archivedBook.create({
        data: { userId, bookId },
      });
      return NextResponse.json({ success: true, isArchived: true, message: 'Archived book from main library' });
    }
  } catch (error) {
    console.error('[ARCHIVE API ERROR]:', error);
    return NextResponse.json({ error: 'Failed to update archive' }, { status: 500 });
  }
}
