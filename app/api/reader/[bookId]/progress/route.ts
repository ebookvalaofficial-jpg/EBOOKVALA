import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { updateProgressSchema } from '@/lib/validations/reader';
import { recordActivityFeedItem } from '@/lib/community/activity';

interface RouteParams {
  params: Promise<{
    bookId: string;
  }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const bookId = resolvedParams.bookId;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const progress = await prisma.readingProgress.findUnique({
      where: {
        userId_bookId: {
          userId: user.id,
          bookId,
        },
      },
    });

    const streak = await prisma.readingStreak.findUnique({
      where: { userId: user.id },
    });

    return NextResponse.json({
      progress: progress || null,
      streak: streak || { currentStreak: 1, longestStreak: 1, lastActiveDate: new Date() },
    });
  } catch (error: any) {
    console.error('Error getting reading progress:', error);
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const bookId = resolvedParams.bookId;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const { currentChapterId, scrollPositionPercent, percentComplete, readingTimeSeconds = 0 } =
      updateProgressSchema.parse(body);

    const now = new Date();

    // 1. Update/Upsert Reading Progress
    const updatedProgress = await prisma.readingProgress.upsert({
      where: {
        userId_bookId: {
          userId: user.id,
          bookId,
        },
      },
      update: {
        currentChapterId,
        scrollPositionPercent,
        percentComplete,
        lastReadAt: now,
        totalReadingTimeSeconds: { increment: readingTimeSeconds },
        streakContribution: true,
      },
      create: {
        userId: user.id,
        bookId,
        currentChapterId,
        scrollPositionPercent,
        percentComplete,
        lastReadAt: now,
        totalReadingTimeSeconds: readingTimeSeconds,
        streakContribution: true,
      },
    });

    // Auto-fire ActivityFeedItem if user completed the book
    if (updatedProgress.percentComplete >= 100) {
      const finishedBook = await prisma.book.findUnique({
        where: { id: bookId },
        select: { title: true },
      });
      await recordActivityFeedItem({
        userId: user.id,
        type: 'FINISHED_BOOK',
        targetType: 'BOOK',
        targetId: bookId,
        metadata: { bookTitle: finishedBook?.title || 'eBook' },
      });
    }

    // 2. Reading Streak Calculation & Update
    let streak = await prisma.readingStreak.findUnique({
      where: { userId: user.id },
    });

    if (!streak) {
      streak = await prisma.readingStreak.create({
        data: {
          userId: user.id,
          currentStreak: 1,
          longestStreak: 1,
          lastActiveDate: now,
        },
      });
    } else {
      const lastActive = new Date(streak.lastActiveDate);
      const isSameDay =
        lastActive.getFullYear() === now.getFullYear() &&
        lastActive.getMonth() === now.getMonth() &&
        lastActive.getDate() === now.getDate();

      if (!isSameDay) {
        // Calculate day diff
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const startOfLast = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate()).getTime();
        const diffDays = Math.round((startOfToday - startOfLast) / (1000 * 3600 * 24));

        let newCurrent = streak.currentStreak;
        if (diffDays === 1) {
          // Continuous streak
          newCurrent += 1;
        } else if (diffDays > 1) {
          // Broken streak
          newCurrent = 1;
        }

        const newLongest = Math.max(streak.longestStreak, newCurrent);

        streak = await prisma.readingStreak.update({
          where: { userId: user.id },
          data: {
            currentStreak: newCurrent,
            longestStreak: newLongest,
            lastActiveDate: now,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      progress: updatedProgress,
      streak,
    });
  } catch (error: any) {
    console.error('Error updating reading progress:', error);
    return NextResponse.json({ error: error?.message || 'Failed to update progress' }, { status: 500 });
  }
}
