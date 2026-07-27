import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, id: true },
    });

    if (!admin || (admin.role !== 'ADMIN' && admin.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { action, userIds } = await req.json();

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: 'No users selected for bulk action' }, { status: 400 });
    }

    if (action === 'BAN') {
      await prisma.user.updateMany({
        where: { id: { in: userIds }, role: { notIn: ['ADMIN', 'SUPER_ADMIN'] } },
        data: { isBanned: true },
      });
    } else if (action === 'UNBAN') {
      await prisma.user.updateMany({
        where: { id: { in: userIds } },
        data: { isBanned: false },
      });
    } else {
      return NextResponse.json({ error: 'Invalid action type' }, { status: 400 });
    }

    await prisma.adminActionLog.create({
      data: {
        adminUserId: admin.id,
        action: `BULK_USER_${action}`,
        targetType: 'USER',
        targetId: `${userIds.length} users`,
        details: `Bulk ${action} executed on ${userIds.length} users`,
      },
    });

    return NextResponse.json({ success: true, count: userIds.length });
  } catch (error) {
    console.error('[BULK USER ACTION ERROR]:', error);
    return NextResponse.json({ error: 'Failed to execute bulk user action' }, { status: 500 });
  }
}
