import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createClubSchema } from '@/lib/validations/community';
import { recordActivityFeedItem } from '@/lib/community/activity';

export async function GET() {
  try {
    const clubs = await prisma.readingClub.findMany({
      include: {
        createdByUser: { select: { id: true, name: true, image: true } },
        currentBook: { select: { id: true, title: true, slug: true, coverImageUrl: true } },
        _count: { select: { members: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ clubs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch reading clubs' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = createClubSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (user.isBanned) return NextResponse.json({ error: 'Account suspended' }, { status: 403 });

    const club = await prisma.readingClub.create({
      data: {
        name: validated.name,
        description: validated.description,
        coverImageUrl: validated.coverImageUrl || null,
        currentBookId: validated.currentBookId || null,
        isPublic: validated.isPublic ?? true,
        memberLimit: validated.memberLimit || null,
        createdByUserId: user.id,
        members: {
          create: {
            userId: user.id,
            role: 'OWNER',
          },
        },
      },
      include: {
        currentBook: { select: { title: true } },
      },
    });

    // Auto-fire ActivityFeedItem
    await recordActivityFeedItem({
      userId: user.id,
      type: 'JOINED_CLUB',
      targetType: 'CLUB',
      targetId: club.id,
      metadata: { clubName: club.name, role: 'OWNER' },
    });

    return NextResponse.json({ club });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create reading club' }, { status: 500 });
  }
}
