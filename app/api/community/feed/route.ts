import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter'); // 'all' or 'following'
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '15', 10);
    const skip = (page - 1) * limit;

    const session = await auth();
    let me: { id: string } | null = null;
    let followedUserIds: string[] = [];

    if (session?.user?.email) {
      me = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });

      if (me) {
        const follows = await prisma.follow.findMany({
          where: { followerId: me.id },
          select: { followingId: true },
        });
        followedUserIds = follows.map((f) => f.followingId);
      }
    }

    const whereClause: any = {
      user: { isBanned: false },
    };

    if (filter === 'following' && me) {
      whereClause.userId = { in: [...followedUserIds, me.id] };
    } else if (me && followedUserIds.length > 0) {
      whereClause.userId = { in: [...followedUserIds, me.id] };
    }

    const [items, total] = await Promise.all([
      prisma.activityFeedItem.findMany({
        where: whereClause,
        include: {
          user: { select: { id: true, name: true, image: true, isAuthor: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.activityFeedItem.count({ where: whereClause }),
    ]);

    const formattedItems = items.map((item) => ({
      ...item,
      metadata: item.metadata ? JSON.parse(item.metadata) : null,
    }));

    return NextResponse.json({
      items: formattedItems,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch activity feed' }, { status: 500 });
  }
}
