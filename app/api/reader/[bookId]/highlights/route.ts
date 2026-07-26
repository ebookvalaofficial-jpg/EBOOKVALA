import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createHighlightSchema, updateHighlightSchema } from '@/lib/validations/reader';

interface RouteParams {
  params: Promise<{
    bookId: string;
  }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const bookId = resolvedParams.bookId;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const highlights = await prisma.highlight.findMany({
      where: { userId: user.id, bookId },
      include: { chapter: { select: { id: true, title: true, order: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ highlights });
  } catch (error: any) {
    console.error('Error fetching highlights:', error);
    return NextResponse.json({ error: 'Failed to fetch highlights' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const bookId = resolvedParams.bookId;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const { chapterId, selectedText, color, note } = createHighlightSchema.parse(body);

    const highlight = await prisma.highlight.create({
      data: {
        userId: user.id,
        bookId,
        chapterId,
        selectedText,
        color,
        note,
      },
      include: { chapter: { select: { id: true, title: true, order: true } } },
    });

    return NextResponse.json({ highlight });
  } catch (error: any) {
    console.error('Error creating highlight:', error);
    return NextResponse.json({ error: error?.message || 'Failed to create highlight' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { highlightId, color, note } = updateHighlightSchema.parse(body);

    const updated = await prisma.highlight.update({
      where: { id: highlightId },
      data: {
        ...(color && { color }),
        ...(note !== undefined && { note }),
      },
    });

    return NextResponse.json({ highlight: updated });
  } catch (error: any) {
    console.error('Error updating highlight:', error);
    return NextResponse.json({ error: 'Failed to update highlight' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const highlightId = searchParams.get('highlightId');

    if (!highlightId) {
      return NextResponse.json({ error: 'Highlight ID required' }, { status: 400 });
    }

    await prisma.highlight.delete({
      where: { id: highlightId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting highlight:', error);
    return NextResponse.json({ error: 'Failed to delete highlight' }, { status: 500 });
  }
}
