import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const todayStr = new Date().toISOString().split('T')[0];

    // Check if already claimed today
    const existing = await prisma.dailyReward.findUnique({
      where: {
        userId_claimedDate: {
          userId,
          claimedDate: todayStr,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Daily reward already claimed for today. Come back tomorrow!' },
        { status: 400 }
      );
    }

    // Award +10 XP and +1 Coin
    await prisma.$transaction([
      prisma.dailyReward.create({
        data: {
          userId,
          claimedDate: todayStr,
          xpAwarded: 10,
          coinsAwarded: 1,
        },
      }),
      prisma.xpLog.create({
        data: {
          userId,
          amount: 10,
          reason: `Daily Streak Reward (${todayStr})`,
        },
      }),
      prisma.coinLog.create({
        data: {
          userId,
          amount: 1,
          reason: `Daily Streak Reward (${todayStr})`,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Claimed +10 XP and +1 Coin for today!',
      xpAwarded: 10,
      coinsAwarded: 1,
    });
  } catch (error) {
    console.error('[DAILY REWARD API ERROR]:', error);
    return NextResponse.json({ error: 'Failed to claim daily reward' }, { status: 500 });
  }
}
