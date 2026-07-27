import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized Admin Access' }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        xpLogs: { select: { amount: true } },
        coinLogs: { select: { amount: true } },
      },
    });

    const userBalances = users.map((u) => {
      const totalXp = u.xpLogs.reduce((acc, l) => acc + l.amount, 0);
      const totalCoins = u.coinLogs.reduce((acc, l) => acc + l.amount, 0);
      const level = Math.floor(totalXp / 100) + 1;

      return {
        id: u.id,
        name: u.name || 'User',
        email: u.email,
        image: u.image,
        totalXp,
        totalCoins,
        level,
      };
    });

    return NextResponse.json({ success: true, users: userBalances });
  } catch (error) {
    console.error('[ADMIN GAMIFICATION GET ERROR]:', error);
    return NextResponse.json({ error: 'Failed to fetch gamification users' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized Admin Access' }, { status: 403 });
    }

    const { userId, type, amount, reason } = await req.json(); // type: 'xp' | 'coins'

    if (!userId || !amount || isNaN(Number(amount))) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const val = Number(amount);

    if (type === 'xp') {
      await prisma.xpLog.create({
        data: {
          userId,
          amount: val,
          reason: reason || 'Admin Manual XP Adjustment',
        },
      });
    } else {
      await prisma.coinLog.create({
        data: {
          userId,
          amount: val,
          reason: reason || 'Admin Manual Coin Adjustment',
        },
      });
    }

    return NextResponse.json({ success: true, message: `Granted ${val} ${type.toUpperCase()} successfully!` });
  } catch (error) {
    console.error('[ADMIN GAMIFICATION POST ERROR]:', error);
    return NextResponse.json({ error: 'Failed to adjust balance' }, { status: 500 });
  }
}
