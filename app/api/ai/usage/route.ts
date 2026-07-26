import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PLAN_LIMITS } from '@/lib/ai/usage-limits';

export async function GET() {
  const session = await auth();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { subscriptions: { where: { status: 'ACTIVE' } } },
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const activeSub = user.subscriptions[0];
    const userPlan = activeSub ? activeSub.plan : 'FREE';
    const limits = PLAN_LIMITS[userPlan] || PLAN_LIMITS.FREE;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const logs = await prisma.aIUsageLog.findMany({
      where: {
        userId: user.id,
        createdAt: { gte: startOfMonth },
      },
    });

    const usageCount: Record<string, number> = {
      CHAT: 0,
      SUMMARY: 0,
      FLASHCARDS: 0,
      QUIZ: 0,
      TRANSLATE: 0,
      NARRATE: 0,
    };

    logs.forEach((log) => {
      if (usageCount[log.feature] !== undefined) {
        usageCount[log.feature] += 1;
      }
    });

    return NextResponse.json({
      userPlan,
      limits,
      usage: usageCount,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch AI usage' }, { status: 500 });
  }
}
