import { NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const { adminUser, errorResponse } = await checkAdminAuth();
  if (errorResponse || !adminUser) return errorResponse;

  try {
    const reports = await prisma.report.findMany({
      include: {
        reporter: { select: { id: true, name: true, email: true } },
        reviewedByAdmin: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ reports });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch community reports' }, { status: 500 });
  }
}
