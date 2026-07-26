import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ onboardingCompleted: true });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { onboardingCompletedAt: true, isAuthor: true },
    });

    if (!user) {
      return NextResponse.json({ onboardingCompleted: true });
    }

    return NextResponse.json({
      onboardingCompleted: !!user.onboardingCompletedAt,
      onboardingCompletedAt: user.onboardingCompletedAt,
      isAuthor: user.isAuthor,
    });
  } catch (error) {
    console.error('[ONBOARDING GET ERROR]:', error);
    return NextResponse.json({ onboardingCompleted: true });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { choice } = body; // 'READER' | 'AUTHOR' | 'SKIP'

    const now = new Date();
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        onboardingCompletedAt: now,
      },
    });

    if (choice === 'AUTHOR') {
      return NextResponse.json({
        success: true,
        redirectUrl: '/become-an-author',
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[ONBOARDING POST ERROR]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
