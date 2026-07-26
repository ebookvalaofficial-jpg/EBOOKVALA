import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createReplySchema } from '@/lib/validations/community';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const replies = await prisma.discussionReply.findMany({
      where: {
        discussionId: id,
        parentReplyId: null, // Top-level replies only
        user: { isBanned: false },
      },
      include: {
        user: { select: { id: true, name: true, image: true, isAuthor: true } },
        childReplies: {
          where: { user: { isBanned: false } },
          include: {
            user: { select: { id: true, name: true, image: true, isAuthor: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ replies });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch replies' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (user.isBanned) return NextResponse.json({ error: 'Account suspended' }, { status: 403 });

    const discussion = await prisma.discussion.findUnique({ where: { id } });
    if (!discussion) return NextResponse.json({ error: 'Discussion not found' }, { status: 404 });

    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';

    // DO NOT allow locked discussions to accept new replies from non-admins
    if (discussion.isLocked && !isAdmin) {
      return NextResponse.json({ error: 'This discussion is locked. No new replies can be added.' }, { status: 403 });
    }

    const body = await req.json();
    const validated = createReplySchema.parse(body);

    const reply = await prisma.discussionReply.create({
      data: {
        discussionId: id,
        userId: user.id,
        body: validated.body,
        parentReplyId: validated.parentReplyId || null,
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json({ reply });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to post reply' }, { status: 500 });
  }
}
