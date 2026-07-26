import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createReportSchema } from '@/lib/validations/community';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized. Please log in to submit a report.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = createReportSchema.parse(body);

    const reporter = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!reporter) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (reporter.isBanned) return NextResponse.json({ error: 'Account suspended' }, { status: 403 });

    const report = await prisma.report.create({
      data: {
        reporterId: reporter.id,
        targetType: validated.targetType,
        targetId: validated.targetId,
        reason: validated.reason,
        details: validated.details || null,
        status: 'PENDING',
      },
    });

    return NextResponse.json({ report, message: 'Report submitted successfully. Thank you for keeping our community safe.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to submit report' }, { status: 500 });
  }
}
