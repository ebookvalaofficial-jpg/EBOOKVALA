import { NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const { adminUser, errorResponse } = await checkAdminAuth();
  if (errorResponse || !adminUser) return errorResponse;

  try {
    const requests = await prisma.payoutRequest.findMany({
      include: { authorUser: { select: { name: true, email: true } } },
      orderBy: { requestedAt: 'desc' },
    });

    return NextResponse.json({ requests });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch payout requests' }, { status: 500 });
  }
}
