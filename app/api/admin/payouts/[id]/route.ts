import { NextResponse } from 'next/server';
import { checkAdminAuth, logAdminAction } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(req: Request, { params }: RouteParams) {
  const { adminUser, errorResponse } = await checkAdminAuth();
  if (errorResponse || !adminUser) return errorResponse;

  try {
    const { id } = await params;
    const body = await req.json();
    const { status, adminNote } = body; // status: 'PROCESSING', 'PAID', 'REJECTED'

    if (!['PROCESSING', 'PAID', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid payout status' }, { status: 400 });
    }

    const payoutReq = await prisma.payoutRequest.findUnique({
      where: { id },
      include: { authorUser: true },
    });

    if (!payoutReq) {
      return NextResponse.json({ error: 'Payout request not found' }, { status: 404 });
    }

    const updatedRequest = await prisma.payoutRequest.update({
      where: { id },
      data: {
        status,
        adminNote: adminNote || payoutReq.adminNote,
        processedAt: status === 'PAID' ? new Date() : payoutReq.processedAt,
      },
    });

    // If marked PAID, transition corresponding PAYABLE RoyaltyLedger entries to PAID to prevent double counting
    if (status === 'PAID') {
      const payableEntries = await prisma.royaltyLedger.findMany({
        where: { authorUserId: payoutReq.authorUserId, status: 'PAYABLE' },
        orderBy: { createdAt: 'asc' },
      });

      let remainingAmount = payoutReq.amount;
      for (const entry of payableEntries) {
        if (remainingAmount <= 0) break;

        await prisma.royaltyLedger.update({
          where: { id: entry.id },
          data: { status: 'PAID' },
        });

        remainingAmount -= entry.royaltyAmount;
      }
    }

    await logAdminAction({
      adminUserId: adminUser.id,
      action: `PAYOUT_REQUEST_${status}`,
      targetType: 'PayoutRequest',
      targetId: payoutReq.id,
      details: { amount: payoutReq.amount, authorEmail: payoutReq.authorUser.email, adminNote },
    });

    return NextResponse.json({ payoutRequest: updatedRequest });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update payout request' }, { status: 500 });
  }
}
