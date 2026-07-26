import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const allAchievements = await prisma.achievement.findMany({
      orderBy: { createdAt: 'asc' },
    });

    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId: user.id },
    });

    const userUnlockedMap = new Map(
      userAchievements.map((ua) => [ua.achievementId, ua.unlockedAt])
    );

    const formattedAchievements = allAchievements.map((ach) => {
      const unlockedAt = userUnlockedMap.get(ach.id);
      return {
        id: ach.id,
        key: ach.key,
        title: ach.title,
        description: ach.description,
        iconName: ach.iconName,
        criteriaDescription: ach.criteriaDescription,
        isUnlocked: Boolean(unlockedAt),
        unlockedAt: unlockedAt ? unlockedAt.toISOString() : null,
      };
    });

    const unlockedCount = formattedAchievements.filter((a) => a.isUnlocked).length;

    return NextResponse.json({
      achievements: formattedAchievements,
      totalCount: allAchievements.length,
      unlockedCount,
    });
  } catch (error: any) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json({ error: 'Failed to fetch achievements' }, { status: 500 });
  }
}
