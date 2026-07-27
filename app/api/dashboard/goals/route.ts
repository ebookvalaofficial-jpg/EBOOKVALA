import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const goal = await prisma.readingGoal.findUnique({
      where: { userId },
    });

    return NextResponse.json({
      success: true,
      goal: goal || {
        dailyMinutes: 30,
        dailyPages: 20,
        weeklyBooks: 1,
        monthlyBooks: 2,
        yearlyBooks: 12,
      },
    });
  } catch (error) {
    console.error('[GOALS GET API ERROR]:', error);
    return NextResponse.json({ error: 'Failed to fetch reading goals' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { dailyMinutes, dailyPages, weeklyBooks, monthlyBooks, yearlyBooks } = await req.json();

    const updated = await prisma.readingGoal.upsert({
      where: { userId },
      update: {
        dailyMinutes: Number(dailyMinutes) || 30,
        dailyPages: Number(dailyPages) || 20,
        weeklyBooks: Number(weeklyBooks) || 1,
        monthlyBooks: Number(monthlyBooks) || 2,
        yearlyBooks: Number(yearlyBooks) || 12,
      },
      create: {
        userId,
        dailyMinutes: Number(dailyMinutes) || 30,
        dailyPages: Number(dailyPages) || 20,
        weeklyBooks: Number(weeklyBooks) || 1,
        monthlyBooks: Number(monthlyBooks) || 2,
        yearlyBooks: Number(yearlyBooks) || 12,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Reading goals updated successfully!',
      goal: updated,
    });
  } catch (error) {
    console.error('[GOALS POST API ERROR]:', error);
    return NextResponse.json({ error: 'Failed to update reading goals' }, { status: 500 });
  }
}
