import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export interface AdminAuthResult {
  adminUser?: {
    id: string;
    email: string;
    name: string | null;
    role: string;
  };
  errorResponse?: NextResponse;
}

export async function checkAdminAuth(superAdminOnly: boolean = false): Promise<AdminAuthResult> {
  const session = await auth();

  if (!session || !session.user?.email) {
    return {
      errorResponse: NextResponse.json({ error: 'Unauthorized: Session required' }, { status: 401 }),
    };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, email: true, name: true, role: true, isBanned: true },
  });

  if (!user || user.isBanned) {
    return {
      errorResponse: NextResponse.json({ error: 'Forbidden: Account suspended or invalid' }, { status: 403 }),
    };
  }

  const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
  if (!isAdmin) {
    return {
      errorResponse: NextResponse.json({ error: 'Forbidden: Admin role required' }, { status: 403 }),
    };
  }

  if (superAdminOnly && user.role !== 'SUPER_ADMIN') {
    return {
      errorResponse: NextResponse.json({ error: 'Forbidden: Super Admin role required' }, { status: 403 }),
    };
  }

  return {
    adminUser: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  };
}

export async function logAdminAction({
  adminUserId,
  action,
  targetType,
  targetId,
  details,
}: {
  adminUserId: string;
  action: string;
  targetType: string;
  targetId: string;
  details?: Record<string, any>;
}) {
  try {
    await prisma.adminActionLog.create({
      data: {
        adminUserId,
        action,
        targetType,
        targetId,
        details: details ? JSON.stringify(details) : null,
      },
    });
  } catch (err) {
    console.error('Error recording admin action log:', err);
  }
}
