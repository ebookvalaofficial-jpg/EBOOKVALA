import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET: Fetch all highlights, bookmarks, sticky notes for user
export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const [highlights, bookmarks, stickyNotes] = await Promise.all([
      prisma.highlight.findMany({
        where: { userId },
        include: { book: true, chapter: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.bookmark.findMany({
        where: { userId },
        include: { book: true, chapter: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.stickyNote.findMany({
        where: { userId },
        include: { book: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return NextResponse.json({
      success: true,
      highlights,
      bookmarks,
      stickyNotes,
    });
  } catch (error) {
    console.error('[DASHBOARD NOTES GET ERROR]:', error);
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}

// POST: Manage Sticky Notes or toggle Highlight public state
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const { type } = body;

    if (type === 'create-sticky') {
      const { title, content, color, bookId } = body;
      const note = await prisma.stickyNote.create({
        data: {
          userId,
          title: title || 'Quick Sticky Note',
          content,
          color: color || 'YELLOW',
          bookId: bookId || undefined,
        },
      });

      // Award XP for first note
      await prisma.xpLog.create({
        data: { userId, amount: 5, reason: 'Created a Sticky Note' },
      });

      return NextResponse.json({ success: true, message: 'Sticky note created!', note });
    } else if (type === 'delete-sticky') {
      const { noteId } = body;
      await prisma.stickyNote.deleteMany({
        where: { id: noteId, userId },
      });
      return NextResponse.json({ success: true, message: 'Sticky note deleted' });
    } else if (type === 'toggle-public-highlight') {
      const { highlightId, isPublic } = body;
      await prisma.highlight.updateMany({
        where: { id: highlightId, userId },
        data: { isPublic: Boolean(isPublic) },
      });
      return NextResponse.json({ success: true, message: 'Updated highlight visibility' });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    console.error('[DASHBOARD NOTES POST ERROR]:', error);
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
  }
}
