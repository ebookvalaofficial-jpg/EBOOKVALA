import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { reactionSchema } from '@/lib/validations/community';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetType = searchParams.get('targetType');
  const targetId = searchParams.get('targetId');

  if (!targetType || !targetId) {
    return NextResponse.json({ error: 'targetType and targetId are required' }, { status: 400 });
  }

  try {
    const session = await auth();
    let userReaction: string | null = null;

    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });

      if (user) {
        const existing = await prisma.reaction.findUnique({
          where: {
            userId_targetType_targetId: {
              userId: user.id,
              targetType,
              targetId,
            },
          },
        });
        userReaction = existing ? existing.type : null;
      }
    }

    const grouped = await prisma.reaction.groupBy({
      by: ['type'],
      where: { targetType, targetId },
      _count: { type: true },
    });

    const counts = {
      LIKE: 0,
      INSIGHTFUL: 0,
      LOVE: 0,
    };

    grouped.forEach((g) => {
      if (g.type in counts) {
        counts[g.type as keyof typeof counts] = g._count.type;
      }
    });

    return NextResponse.json({
      userReaction,
      counts,
      totalReactions: counts.LIKE + counts.INSIGHTFUL + counts.LOVE,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch reactions' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = reactionSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (user.isBanned) return NextResponse.json({ error: 'Account suspended' }, { status: 403 });

    const existing = await prisma.reaction.findUnique({
      where: {
        userId_targetType_targetId: {
          userId: user.id,
          targetType: validated.targetType,
          targetId: validated.targetId,
        },
      },
    });

    let userReactionNow: string | null = null;

    if (existing) {
      if (existing.type === validated.type) {
        // Same type -> remove reaction
        await prisma.reaction.delete({ where: { id: existing.id } });
        userReactionNow = null;
      } else {
        // Different type -> swap reaction
        const updated = await prisma.reaction.update({
          where: { id: existing.id },
          data: { type: validated.type },
        });
        userReactionNow = updated.type;
      }
    } else {
      // Create new reaction
      const created = await prisma.reaction.create({
        data: {
          userId: user.id,
          targetType: validated.targetType,
          targetId: validated.targetId,
          type: validated.type,
        },
      });
      userReactionNow = created.type;
    }

    const grouped = await prisma.reaction.groupBy({
      by: ['type'],
      where: { targetType: validated.targetType, targetId: validated.targetId },
      _count: { type: true },
    });

    const counts = {
      LIKE: 0,
      INSIGHTFUL: 0,
      LOVE: 0,
    };

    grouped.forEach((g) => {
      if (g.type in counts) {
        counts[g.type as keyof typeof counts] = g._count.type;
      }
    });

    return NextResponse.json({
      userReaction: userReactionNow,
      counts,
      totalReactions: counts.LIKE + counts.INSIGHTFUL + counts.LOVE,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to process reaction' }, { status: 500 });
  }
}
