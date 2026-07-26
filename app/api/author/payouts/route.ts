import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { payoutRequestSchema } from '@/lib/validations/author';

export async function GET() {
  const session = await auth();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user || !user.isAuthor) return NextResponse.json({ error: 'Author access required' }, { status: 403 });

    const requests = await prisma.payoutRequest.findMany({
      where: { authorUserId: user.id },
      orderBy: { requestedAt: 'desc' },
    });

    return NextResponse.json({ requests });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch payout requests' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user || !user.isAuthor) return NextResponse.json({ error: 'Author access required' }, { status: 403 });

    const body = await req.json();
    const validated = payoutRequestSchema.parse(body);

    // Calculate current PAYABLE balance
    const payableEntries = await prisma.royaltyLedger.findMany({
      where: { authorUserId: user.id, status: 'PAYABLE' },
    });

    const payableBalance = payableEntries.reduce((sum, e) => sum + e.royaltyAmount, 0);

    if (validated.amount > payableBalance) {
      return NextResponse.json({
        error: `Requested amount (₹${validated.amount}) exceeds available payable balance of ₹${payableBalance}`,
      }, { status: 400 });
    }

    const payoutRequest = await prisma.payoutRequest.create({
      data: {
        authorUserId: user.id,
        amount: validated.amount,
        status: 'REQUESTED',
      },
    });

    return NextResponse.json({ payoutRequest });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to submit payout request' }, { status: 500 });
  }
}
