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
    const { action, deleteTarget } = body; // action: 'DISMISSED' or 'ACTION_TAKEN'

    if (!['DISMISSED', 'ACTION_TAKEN'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Must be DISMISSED or ACTION_TAKEN' }, { status: 400 });
    }

    const report = await prisma.report.findUnique({ where: { id } });
    if (!report) return NextResponse.json({ error: 'Report not found' }, { status: 404 });

    // Optional: Delete/Lock underlying target content if deleteTarget === true
    if (action === 'ACTION_TAKEN' && deleteTarget) {
      if (report.targetType === 'DISCUSSION') {
        await prisma.discussion.deleteMany({ where: { id: report.targetId } });
      } else if (report.targetType === 'REPLY') {
        await prisma.discussionReply.deleteMany({ where: { id: report.targetId } });
      } else if (report.targetType === 'REVIEW') {
        await prisma.review.updateMany({
          where: { id: report.targetId },
          data: { isHidden: true },
        });
      } else if (report.targetType === 'USER') {
        await prisma.user.updateMany({
          where: { id: report.targetId },
          data: { isBanned: true },
        });
      }
    }

    const updatedReport = await prisma.report.update({
      where: { id },
      data: {
        status: action,
        reviewedByAdminId: adminUser.id,
        reviewedAt: new Date(),
      },
    });

    await logAdminAction({
      adminUserId: adminUser.id,
      action: `COMMUNITY_REPORT_${action}`,
      targetType: 'Report',
      targetId: report.id,
      details: {
        reportTargetType: report.targetType,
        reportTargetId: report.targetId,
        deleteTarget: Boolean(deleteTarget),
      },
    });

    return NextResponse.json({ report: updatedReport });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to process report' }, { status: 500 });
  }
}
