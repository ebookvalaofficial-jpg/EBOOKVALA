import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { recordActivityFeedItem } from '@/lib/community/activity';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const club = await prisma.readingClub.findUnique({
      where: { id },
      include: {
        createdByUser: { select: { id: true, name: true, image: true } },
        currentBook: { select: { id: true, title: true, slug: true, coverImageUrl: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, image: true, isAuthor: true } },
          },
          orderBy: { joinedAt: 'asc' },
        },
        _count: { select: { members: true } },
      },
    });

    if (!club) {
      return NextResponse.json({ error: 'Reading club not found' }, { status: 404 });
    }

    return NextResponse.json({ club });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch reading club' }, { status: 500 });
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

    const member = await prisma.readingClubMember.findUnique({
      where: { clubId_userId: { clubId: id, userId: user.id } },
    });

    const isOwnerOrMod = member && ['OWNER', 'MODERATOR'].includes(member.role);
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';

    if (!isOwnerOrMod && !isAdmin) {
      return NextResponse.json({ error: 'Only club owners/moderators can update details' }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, coverImageUrl, currentBookId, isPublic, memberLimit } = body;

    const updated = await prisma.readingClub.update({
      where: { id },
      data: {
        name: name || undefined,
        description: description || undefined,
        coverImageUrl: coverImageUrl !== undefined ? coverImageUrl : undefined,
        currentBookId: currentBookId !== undefined ? currentBookId : undefined,
        isPublic: isPublic !== undefined ? Boolean(isPublic) : undefined,
        memberLimit: memberLimit !== undefined ? (memberLimit ? Number(memberLimit) : null) : undefined,
      },
    });

    return NextResponse.json({ club: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update reading club' }, { status: 500 });
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

    const club = await prisma.readingClub.findUnique({
      where: { id },
      include: { _count: { select: { members: true } } },
    });

    if (!club) return NextResponse.json({ error: 'Reading club not found' }, { status: 404 });

    const existingMember = await prisma.readingClubMember.findUnique({
      where: { clubId_userId: { clubId: id, userId: user.id } },
    });

    if (existingMember) {
      // Leave club (Owner cannot leave unless transferring or deleting)
      if (existingMember.role === 'OWNER') {
        return NextResponse.json({ error: 'As the club owner, you cannot leave your own club.' }, { status: 400 });
      }

      await prisma.readingClubMember.delete({ where: { id: existingMember.id } });
      return NextResponse.json({ isMember: false, message: 'Successfully left reading club' });
    }

    // Join club: check member limit
    if (club.memberLimit && club._count.members >= club.memberLimit) {
      return NextResponse.json({ error: `Member limit of ${club.memberLimit} reached` }, { status: 400 });
    }

    const newMember = await prisma.readingClubMember.create({
      data: {
        clubId: id,
        userId: user.id,
        role: 'MEMBER',
      },
    });

    // Auto-fire ActivityFeedItem
    await recordActivityFeedItem({
      userId: user.id,
      type: 'JOINED_CLUB',
      targetType: 'CLUB',
      targetId: club.id,
      metadata: { clubName: club.name },
    });

    return NextResponse.json({ isMember: true, member: newMember, message: 'Successfully joined reading club' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to toggle club membership' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get('targetUserId');
    const newRole = searchParams.get('newRole');

    const me = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!me) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const myMembership = await prisma.readingClubMember.findUnique({
      where: { clubId_userId: { clubId: id, userId: me.id } },
    });

    const isOwnerOrMod = myMembership && ['OWNER', 'MODERATOR'].includes(myMembership.role);
    const isAdmin = me.role === 'ADMIN' || me.role === 'SUPER_ADMIN';

    if (!isOwnerOrMod && !isAdmin) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    if (!targetUserId) {
      return NextResponse.json({ error: 'targetUserId required' }, { status: 400 });
    }

    const targetMembership = await prisma.readingClubMember.findUnique({
      where: { clubId_userId: { clubId: id, userId: targetUserId } },
    });

    if (!targetMembership) {
      return NextResponse.json({ error: 'Member not found in club' }, { status: 404 });
    }

    if (newRole) {
      // Role promotion/demotion
      const updated = await prisma.readingClubMember.update({
        where: { id: targetMembership.id },
        data: { role: newRole },
      });
      return NextResponse.json({ member: updated });
    } else {
      // Remove member
      await prisma.readingClubMember.delete({
        where: { id: targetMembership.id },
      });
      return NextResponse.json({ success: true, message: 'Member removed from club' });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to manage club member' }, { status: 500 });
  }
}
