import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') || 'all-time'; // 'all-time' | 'monthly' | 'weekly'

    // Compute leaderboard ranking for public users
    const users = await prisma.user.findMany({
      where: {
        showOnLeaderboard: true,
        isBanned: false,
      },
      select: {
        id: true,
        name: true,
        image: true,
        createdAt: true,
        xpLogs: {
          select: { amount: true, createdAt: true },
        },
      },
    });

    const now = new Date();
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const leaderboard = users
      .map((u) => {
        let totalXp = 0;
        u.xpLogs.forEach((log) => {
          const logDate = new Date(log.createdAt);
          if (filter === 'weekly' && logDate >= startOfWeek) {
            totalXp += log.amount;
          } else if (filter === 'monthly' && logDate >= startOfMonth) {
            totalXp += log.amount;
          } else if (filter === 'all-time') {
            totalXp += log.amount;
          }
        });

        // Compute level
        const level = Math.floor(totalXp / 100) + 1;

        return {
          userId: u.id,
          name: u.name || 'Anonymous Reader',
          image: u.image || null,
          totalXp,
          level,
          isCurrentUser: u.id === userId,
        };
      })
      .filter((u) => u.totalXp > 0 || u.isCurrentUser)
      .sort((a, b) => b.totalXp - a.totalXp)
      .map((user, idx) => ({ ...user, rank: idx + 1 }));

    // User's own total stats if logged in
    let currentUserStats = null;
    if (userId) {
      const [xpSum, coinSum, user] = await Promise.all([
        prisma.xpLog.aggregate({
          where: { userId },
          _sum: { amount: true },
        }),
        prisma.coinLog.aggregate({
          where: { userId },
          _sum: { amount: true },
        }),
        prisma.user.findUnique({
          where: { id: userId },
          select: { referralCode: true, showOnLeaderboard: true },
        }),
      ]);

      const userXp = xpSum._sum.amount || 10;
      const userCoins = coinSum._sum.amount || 1;
      const rank = leaderboard.find((l) => l.isCurrentUser)?.rank || 'N/A';

      currentUserStats = {
        totalXp: userXp,
        totalCoins: userCoins,
        level: Math.floor(userXp / 100) + 1,
        rank,
        referralCode: user?.referralCode || `REF-${userId.slice(0, 6).toUpperCase()}`,
        showOnLeaderboard: user?.showOnLeaderboard ?? true,
      };
    }

    return NextResponse.json({
      success: true,
      leaderboard: leaderboard.slice(0, 50), // Top 50
      currentUserStats,
    });
  } catch (error) {
    console.error('[GAMIFICATION LEADERBOARD API ERROR]:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
