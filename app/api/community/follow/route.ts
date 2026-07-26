import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetUserId = searchParams.get('targetUserId');

  if (!targetUserId) {
    return NextResponse.json({ error: 'targetUserId is required' }, { status: 400 });
  }

  try {
    const session = await auth();
    let isFollowing = false;

    if (session?.user?.email) {
      const me = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });

      if (me) {
        const existing = await prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: me.id,
              followingId: targetUserId,
            },
          },
        });
        isFollowing = !!existing;
      }
    }

    const followersCount = await prisma.follow.count({
      where: { followingId: targetUserId },
    });

    const followingCount = await prisma.follow.count({
      where: { followerId: targetUserId },
    });

    return NextResponse.json({
      isFollowing,
      followersCount,
      followingCount,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch follow status' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { targetUserId } = body;

    if (!targetUserId) {
      return NextResponse.json({ error: 'targetUserId is required' }, { status: 400 });
    }

    const me = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!me) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Prevent self-follow
    if (me.id === targetUserId) {
      return NextResponse.json({ error: 'You cannot follow yourself' }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) return NextResponse.json({ error: 'Target user not found' }, { status: 404 });

    const existing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: me.id,
          followingId: targetUserId,
        },
      },
    });

    let isFollowingNow = false;

    if (existing) {
      // Unfollow
      await prisma.follow.delete({
        where: { id: existing.id },
      });
      isFollowingNow = false;
    } else {
      // Follow
      await prisma.follow.create({
        data: {
          followerId: me.id,
          followingId: targetUserId,
        },
      });
      isFollowingNow = true;
    }

    const followersCount = await prisma.follow.count({
      where: { followingId: targetUserId },
    });

    return NextResponse.json({
      isFollowing: isFollowingNow,
      followersCount,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to toggle follow' }, { status: 500 });
  }
}
