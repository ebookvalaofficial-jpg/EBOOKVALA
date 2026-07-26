import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const existingSub = await prisma.subscription.findFirst({
      where: { userId: user.id, status: 'ACTIVE' },
    });

    if (!existingSub || existingSub.plan === 'FREE') {
      return NextResponse.json({ error: 'No active paid subscription found' }, { status: 400 });
    }

    const updatedSub = await prisma.subscription.update({
      where: { id: existingSub.id },
      data: {
        status: 'CANCELLED',
        cancelAtPeriodEnd: true,
      },
    });

    return NextResponse.json({
      subscription: updatedSub,
      message: `Your subscription is cancelled. Access remains active until ${
        updatedSub.currentPeriodEnd
          ? updatedSub.currentPeriodEnd.toLocaleDateString()
          : 'end of billing period'
      }.`,
    });
  } catch (error: any) {
    console.error('Error cancelling subscription:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
