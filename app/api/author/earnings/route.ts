import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user || !user.isAuthor) return NextResponse.json({ error: 'Author access required' }, { status: 403 });

    // Auto-transition PENDING ledger entries > 14 days old to PAYABLE
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    await prisma.royaltyLedger.updateMany({
      where: {
        authorUserId: user.id,
        status: 'PENDING',
        createdAt: { lte: fourteenDaysAgo },
      },
      data: { status: 'PAYABLE' },
    });

    const entries = await prisma.royaltyLedger.findMany({
      where: { authorUserId: user.id },
      include: { book: { select: { title: true, coverImageUrl: true } } },
      orderBy: { createdAt: 'desc' },
    });

    let pendingAmount = 0;
    let payableAmount = 0;
    let paidAmount = 0;

    entries.forEach((e) => {
      if (e.status === 'PENDING') pendingAmount += e.royaltyAmount;
      if (e.status === 'PAYABLE') payableAmount += e.royaltyAmount;
      if (e.status === 'PAID') paidAmount += e.royaltyAmount;
    });

    return NextResponse.json({
      pendingAmount,
      payableAmount,
      paidAmount,
      totalEarnings: pendingAmount + payableAmount + paidAmount,
      entries,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch author earnings' }, { status: 500 });
  }
}
