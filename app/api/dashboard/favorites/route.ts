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

    const existing = await prisma.favorite.findUnique({
      where: { userId_bookId: { userId, bookId } },
    });

    if (existing) {
      await prisma.favorite.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ success: true, isFavorited: false, message: 'Removed from Favorites' });
    } else {
      await prisma.favorite.create({
        data: { userId, bookId },
      });
      return NextResponse.json({ success: true, isFavorited: true, message: 'Added to Favorites' });
    }
  } catch (error) {
    console.error('[FAVORITES API ERROR]:', error);
    return NextResponse.json({ error: 'Failed to update favorites' }, { status: 500 });
  }
}
