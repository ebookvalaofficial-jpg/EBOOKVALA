import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET: List all collections for user
export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const collections = await prisma.collection.findMany({
      where: { userId },
      include: {
        books: {
          include: { book: { include: { author: true, category: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, collections });
  } catch (error) {
    console.error('[COLLECTIONS GET ERROR]:', error);
    return NextResponse.json({ error: 'Failed to fetch collections' }, { status: 500 });
  }
}

// POST: Create collection or Add/Remove book from collection
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { action, name, collectionId, bookId } = await req.json();

    if (action === 'create') {
      if (!name || !name.trim()) {
        return NextResponse.json({ error: 'Collection name is required' }, { status: 400 });
      }
      const collection = await prisma.collection.create({
        data: { userId, name: name.trim() },
      });
      return NextResponse.json({ success: true, message: 'Collection created!', collection });
    } else if (action === 'add-book') {
      const exists = await prisma.collectionBook.findUnique({
        where: { collectionId_bookId: { collectionId, bookId } },
      });
      if (!exists) {
        await prisma.collectionBook.create({
          data: { collectionId, bookId },
        });
      }
      return NextResponse.json({ success: true, message: 'Added book to collection' });
    } else if (action === 'remove-book') {
      await prisma.collectionBook.deleteMany({
        where: { collectionId, bookId },
      });
      return NextResponse.json({ success: true, message: 'Removed book from collection' });
    } else if (action === 'delete-collection') {
      await prisma.collection.deleteMany({
        where: { id: collectionId, userId },
      });
      return NextResponse.json({ success: true, message: 'Collection deleted' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[COLLECTIONS POST ERROR]:', error);
    return NextResponse.json({ error: 'Failed to process collection' }, { status: 500 });
  }
}
