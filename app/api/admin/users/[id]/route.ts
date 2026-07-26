import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdminAuth, logAdminAction } from '@/lib/admin-auth';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { errorResponse } = await checkAdminAuth();
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        subscriptions: true,
        orders: { orderBy: { createdAt: 'desc' }, include: { items: true } },
        purchases: { orderBy: { purchasedAt: 'desc' }, include: { book: { select: { title: true, coverImageUrl: true } } } },
        readingProgress: { orderBy: { lastReadAt: 'desc' }, include: { book: { select: { title: true } } } },
        reviews: { orderBy: { createdAt: 'desc' }, include: { book: { select: { title: true } } } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch user details' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { adminUser, errorResponse } = await checkAdminAuth();
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;
    const body = await req.json();

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    // 1. Role Change Action (SUPER_ADMIN ONLY REQUIREMENT)
    if (body.role !== undefined && body.role !== targetUser.role) {
      if (adminUser!.role !== 'SUPER_ADMIN') {
        return NextResponse.json(
          { error: 'Security Violation: Only SUPER_ADMIN users can change user roles' },
          { status: 403 }
        );
      }

      // Prevent self-demotion if last super admin
      if (targetUser.id === adminUser!.id && body.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Cannot demote your own Super Admin account' }, { status: 400 });
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: { role: body.role },
      });

      await logAdminAction({
        adminUserId: adminUser!.id,
        action: 'USER_ROLE_CHANGED',
        targetType: 'User',
        targetId: id,
        details: { oldRole: targetUser.role, newRole: body.role, targetEmail: targetUser.email },
      });

      return NextResponse.json({ user: updatedUser, message: 'Role updated successfully' });
    }

    // 2. Ban / Unban Toggle Action
    if (body.isBanned !== undefined && Boolean(body.isBanned) !== Boolean(targetUser.isBanned)) {
      // Regular ADMIN or SUPER_ADMIN can ban regular users, but ADMINs cannot ban another ADMIN or SUPER_ADMIN
      if (
        adminUser!.role !== 'SUPER_ADMIN' &&
        (targetUser.role === 'ADMIN' || targetUser.role === 'SUPER_ADMIN')
      ) {
        return NextResponse.json(
          { error: 'Security Violation: Regular Admins cannot ban other Admin accounts' },
          { status: 403 }
        );
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: { isBanned: Boolean(body.isBanned) },
      });

      const actionName = body.isBanned ? 'USER_BANNED' : 'USER_UNBANNED';

      await logAdminAction({
        adminUserId: adminUser!.id,
        action: actionName,
        targetType: 'User',
        targetId: id,
        details: { targetEmail: targetUser.email, isBanned: body.isBanned },
      });

      return NextResponse.json({ user: updatedUser, message: `User account ${body.isBanned ? 'banned' : 'unbanned'}` });
    }

    return NextResponse.json({ error: 'No valid update parameters supplied' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update user' }, { status: 500 });
  }
}
