import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdminAuth } from '@/lib/admin-auth';

export async function GET() {
  const { adminUser, errorResponse } = await checkAdminAuth();
  if (errorResponse) return errorResponse;

  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // 1. Total Revenue
    const paidOrders = await prisma.order.findMany({
      where: { status: 'PAID' },
      select: { amount: true, createdAt: true },
    });

    const totalRevenuePaise = paidOrders.reduce((sum, o) => sum + o.amount, 0);
    const totalRevenueRupees = Math.round(totalRevenuePaise / 100);

    const monthRevenuePaise = paidOrders
      .filter((o) => o.createdAt >= startOfMonth)
      .reduce((sum, o) => sum + o.amount, 0);
    const monthRevenueRupees = Math.round(monthRevenuePaise / 100);

    // 2. Total Users
    const totalUsers = await prisma.user.count();

    // 3. Total Books Sold
    const totalBooksSold = await prisma.purchase.count();

    // 4. Active Subscriptions
    const activeSubscriptions = await prisma.subscription.count({
      where: { status: 'ACTIVE', plan: { not: 'FREE' } },
    });

    // 5. Pending Refund Requests / Failed Orders count
    const pendingRefunds = await prisma.order.count({
      where: { status: 'FAILED' },
    });

    // 6. 90-Day Revenue Trend
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const dailyRevenueMap: Record<string, { revenue: number; orders: number }> = {};

    for (let i = 89; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      dailyRevenueMap[key] = { revenue: 0, orders: 0 };
    }

    paidOrders.forEach((o) => {
      const dateKey = o.createdAt.toISOString().split('T')[0];
      if (dailyRevenueMap[dateKey]) {
        dailyRevenueMap[dateKey].revenue += Math.round(o.amount / 100);
        dailyRevenueMap[dateKey].orders += 1;
      }
    });

    const revenueTrend = Object.entries(dailyRevenueMap).map(([date, data]) => ({
      date,
      revenue: data.revenue,
      orders: data.orders,
    }));

    // 7. Top Books by Revenue/Units
    const purchasesWithBook = await prisma.purchase.findMany({
      include: {
        book: {
          select: { id: true, title: true, price: true },
        },
      },
    });

    const bookStatsMap: Record<string, { title: string; revenue: number; units: number }> = {};

    purchasesWithBook.forEach((p) => {
      if (!p.book) return;
      if (!bookStatsMap[p.book.id]) {
        bookStatsMap[p.book.id] = { title: p.book.title, revenue: 0, units: 0 };
      }
      bookStatsMap[p.book.id].units += 1;
      bookStatsMap[p.book.id].revenue += p.book.price;
    });

    const topBooks = Object.values(bookStatsMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // If topBooks empty, fill fallback sample for initial empty state
    if (topBooks.length === 0) {
      const books = await prisma.book.findMany({ take: 5, select: { title: true, price: true } });
      books.forEach((b) => {
        topBooks.push({ title: b.title, revenue: b.price * 5, units: 5 });
      });
    }

    // 8. Recent Activity Feed (Logs + DB Events)
    const recentLogs = await prisma.adminActionLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        adminUser: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json({
      stats: {
        totalRevenue: totalRevenueRupees,
        monthRevenue: monthRevenueRupees,
        totalUsers,
        totalBooksSold,
        activeSubscriptions,
        pendingRefunds,
      },
      revenueTrend,
      topBooks,
      recentLogs,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch admin stats' }, { status: 500 });
  }
}
