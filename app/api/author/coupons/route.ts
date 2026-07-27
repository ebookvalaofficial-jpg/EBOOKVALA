import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const coupons = await prisma.promoCode.findMany({
      where: { authorUserId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ coupons });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch author coupons' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code, discountType, discountValue, maxUses } = await req.json();

    if (!code || !discountValue) {
      return NextResponse.json({ error: 'Code and discount value are required.' }, { status: 400 });
    }

    const normalizedCode = code.trim().toUpperCase();

    // Check if code exists
    const existing = await prisma.promoCode.findUnique({
      where: { code: normalizedCode },
    });

    if (existing) {
      return NextResponse.json({ error: 'Coupon code already exists. Please pick a unique code.' }, { status: 400 });
    }

    const newCoupon = await prisma.promoCode.create({
      data: {
        code: normalizedCode,
        discountType: discountType || 'PERCENT',
        discountValue: parseInt(discountValue, 10),
        maxUses: maxUses ? parseInt(maxUses, 10) : null,
        authorUserId: session.user.id,
      },
    });

    return NextResponse.json({ success: true, coupon: newCoupon });
  } catch (error) {
    console.error('[AUTHOR COUPON CREATE ERROR]:', error);
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 });
  }
}
