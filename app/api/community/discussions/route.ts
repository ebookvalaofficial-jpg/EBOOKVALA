import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createDiscussionSchema } from '@/lib/validations/community';
import { recordActivityFeedItem } from '@/lib/community/activity';
import { checkRateLimit } from '@/lib/rate-limit';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const bookId = searchParams.get('bookId');
  const categoryId = searchParams.get('categoryId');
  const query = searchParams.get('query');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const skip = (page - 1) * limit;

  try {
    const whereClause: any = {
      authorUser: { isBanned: false },
    };

    if (bookId) whereClause.bookId = bookId;
    if (categoryId) whereClause.categoryId = categoryId;
    if (query) {
      whereClause.OR = [
        { title: { contains: query } },
        { body: { contains: query } },
      ];
    }

    const [discussions, total] = await Promise.all([
      prisma.discussion.findMany({
        where: whereClause,
        include: {
          authorUser: { select: { id: true, name: true, image: true, isAuthor: true } },
          book: { select: { id: true, title: true, slug: true, coverImageUrl: true } },
          category: { select: { id: true, name: true, slug: true } },
          _count: { select: { replies: true } },
        },
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      prisma.discussion.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      discussions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch discussions' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = createDiscussionSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (user.isBanned) return NextResponse.json({ error: 'Account suspended' }, { status: 403 });

    const rateLimit = checkRateLimit(`create_discussion_${user.id}`, 10, 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json({ error: 'Too many discussion posts. Please wait a minute.' }, { status: 429 });
    }

    const discussion = await prisma.discussion.create({
      data: {
        authorUserId: user.id,
        title: validated.title,
        body: validated.body,
        bookId: validated.bookId || null,
        categoryId: validated.categoryId || null,
      },
      include: {
        authorUser: { select: { id: true, name: true, image: true } },
        book: { select: { title: true } },
      },
    });

    // Auto-fire ActivityFeedItem
    await recordActivityFeedItem({
      userId: user.id,
      type: 'STARTED_DISCUSSION',
      targetType: 'DISCUSSION',
      targetId: discussion.id,
      metadata: { title: discussion.title, bookTitle: discussion.book?.title },
    });

    return NextResponse.json({ discussion });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create discussion' }, { status: 500 });
  }
}
