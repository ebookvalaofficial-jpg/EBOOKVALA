import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createSubscriptionSchema } from '@/lib/validations/checkout';

const planPrices: Record<string, number> = {
  FREE: 0,
  STARTER: 50,
  READER: 100,
  PLUS: 180,
  PRO: 300,
};

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const body = await req.json();
    const { plan } = createSubscriptionSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const price = planPrices[plan] || 0;
    const currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 Days period

    // Upsert User Subscription
    const subscription = await prisma.subscription.upsert({
      where: { userId: user.id },
      update: {
        plan,
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd,
        cancelAtPeriodEnd: false,
      },
      create: {
        userId: user.id,
        plan,
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd,
      },
    });

    return NextResponse.json({
      subscription,
      message: `Successfully subscribed to EbookVala ${plan} Plan (₹${price}/mo)`,
    });
  } catch (error: any) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create subscription' },
      { status: 500 }
    );
  }
}
