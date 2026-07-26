import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const discussion = await prisma.discussion.findUnique({
      where: { id },
      include: {
        authorUser: { select: { id: true, name: true, image: true, isAuthor: true, isBanned: true } },
        book: { select: { id: true, title: true, slug: true, coverImageUrl: true } },
        category: { select: { id: true, name: true, slug: true } },
        _count: { select: { replies: true } },
      },
    });

    if (!discussion || discussion.authorUser.isBanned) {
      return NextResponse.json({ error: 'Discussion not found or unavailable' }, { status: 404 });
    }

    // Increment viewCount
    await prisma.discussion.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json({ discussion });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch discussion' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const discussion = await prisma.discussion.findUnique({ where: { id } });
    if (!discussion) return NextResponse.json({ error: 'Discussion not found' }, { status: 404 });

    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    const isAuthor = discussion.authorUserId === user.id;

    if (!isAdmin && !isAuthor) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const body = await req.json();
    const updateData: any = {};

    if (body.title !== undefined && isAuthor) updateData.title = body.title;
    if (body.body !== undefined && isAuthor) updateData.body = body.body;
    if (body.isPinned !== undefined && isAdmin) updateData.isPinned = Boolean(body.isPinned);
    if (body.isLocked !== undefined && isAdmin) updateData.isLocked = Boolean(body.isLocked);

    const updated = await prisma.discussion.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ discussion: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update discussion' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const discussion = await prisma.discussion.findUnique({ where: { id } });
    if (!discussion) return NextResponse.json({ error: 'Discussion not found' }, { status: 404 });

    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    const isAuthor = discussion.authorUserId === user.id;

    if (!isAdmin && !isAuthor) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    await prisma.discussion.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete discussion' }, { status: 500 });
  }
}
