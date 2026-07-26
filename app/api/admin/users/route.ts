import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdminAuth } from '@/lib/admin-auth';

export async function GET() {
  const { errorResponse } = await checkAdminAuth();
  if (errorResponse) return errorResponse;

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        isBanned: true,
        provider: true,
        createdAt: true,
        subscriptions: { select: { plan: true, status: true } },
        orders: { where: { status: 'PAID' }, select: { amount: true } },
        _count: { select: { purchases: true, reviews: true, orders: true } },
      },
    });

    const formattedUsers = users.map((u) => {
      const totalSpentPaise = u.orders.reduce((sum, o) => sum + o.amount, 0);
      const activeSub = u.subscriptions.find((s) => s.status === 'ACTIVE');

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        image: u.image,
        role: u.role || 'USER',
        isBanned: Boolean(u.isBanned),
        provider: u.provider || 'credentials',
        createdAt: u.createdAt,
        plan: activeSub?.plan || 'FREE',
        totalSpentRupees: Math.round(totalSpentPaise / 100),
        purchasesCount: u._count.purchases,
        ordersCount: u._count.orders,
      };
    });

    return NextResponse.json({ users: formattedUsers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch users' }, { status: 500 });
  }
}
