import React from 'react';
import dynamic from 'next/dynamic';
import StatCard from '@/components/dashboard/StatCard';
import Link from 'next/link';
import { ShieldCheck, Plus, ArrowUpRight } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { formatCurrency, formatRelativeTime, formatFullDate } from '@/lib/formatters';

const RevenueChart = dynamic(() => import('@/components/admin/RevenueChart'), {
  loading: () => <div className="h-64 flex items-center justify-center text-xs text-theme-muted">Loading revenue chart...</div>,
});

const TopBooksChart = dynamic(() => import('@/components/admin/TopBooksChart'), {
  loading: () => <div className="h-64 flex items-center justify-center text-xs text-theme-muted">Loading top books chart...</div>,
});

export default async function AdminOverviewPage() {
  const session = await auth();

  // Fetch initial analytics server side
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    paidOrders,
    totalUsersCount,
    totalBooksSoldCount,
    activeSubsCount,
    pendingRefundsCount,
    recentLogs,
    pendingAuthorApps,
    pendingSubmissions,
    pendingPayouts,
    stalePayoutsCount,
    pendingDmcaCount,
    unreadContactCount,
  ] = await Promise.all([
    prisma.order.findMany({
      where: { status: 'PAID' },
      select: { amount: true, createdAt: true },
    }),
    prisma.user.count(),
    prisma.purchase.count(),
    prisma.subscription.count({ where: { status: 'ACTIVE', plan: { not: 'FREE' } } }),
    prisma.order.count({ where: { status: 'FAILED' } }),
    prisma.adminActionLog.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: { adminUser: { select: { name: true, email: true } } },
    }),
    prisma.authorApplication.count({ where: { status: 'PENDING' } }),
    prisma.authorBookSubmission.count({ where: { status: 'PENDING' } }),
    prisma.payoutRequest.count({ where: { status: 'PENDING' } }),
    prisma.payoutRequest.count({
      where: {
        status: 'PENDING',
        createdAt: { lte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.dmcaRequest.count({ where: { status: 'PENDING' } }),
    prisma.contactMessage.count({ where: { status: 'UNREAD' } }),
  ]);

  const totalRevenuePaise = paidOrders.reduce((sum, o) => sum + o.amount, 0);
  const totalRevenue = Math.round(totalRevenuePaise / 100);

  const monthRevenuePaise = paidOrders
    .filter((o) => o.createdAt >= startOfMonth)
    .reduce((sum, o) => sum + o.amount, 0);
  const monthRevenue = Math.round(monthRevenuePaise / 100);

  // Build 90-day revenue array
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

  // Top books by revenue
  const purchasesWithBook = await prisma.purchase.findMany({
    include: { book: { select: { id: true, title: true, price: true } } },
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

  if (topBooks.length === 0) {
    const books = await prisma.book.findMany({ take: 5, select: { title: true } });
    books.forEach((b) => {
      topBooks.push({ title: b.title, revenue: 0, units: 0 });
    });
  }

  return (
    <div className="space-y-8 text-theme-text font-inter">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-blue-500/20 text-white shadow-xl">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-blue-400 font-montserrat">
            <ShieldCheck className="w-4 h-4" />
            <span>Platform Operations & Control</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-montserrat">
            Admin Operations Dashboard
          </h1>
          <p className="text-xs text-slate-300">
            Welcome back, <span className="font-bold text-white">{session?.user?.name || 'Administrator'}</span>. Real-time platform business pulse.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/books/new"
            className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create New eBook</span>
          </Link>
        </div>
      </div>

      {/* StatCards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          subtext={`${formatCurrency(monthRevenue)} this month`}
          iconName="ShoppingBag"
          colorClass="text-emerald-500"
          bgClass="bg-emerald-500/10 border-emerald-500/20"
        />

        <StatCard
          title="Total Users"
          value={totalUsersCount.toLocaleString('en-IN')}
          subtext="Registered Accounts"
          iconName="CheckCircle"
          colorClass="text-blue-500"
          bgClass="bg-blue-500/10 border-blue-500/20"
        />

        <StatCard
          title="Books Sold"
          value={totalBooksSoldCount.toLocaleString('en-IN')}
          subtext="Total Purchases"
          iconName="BookOpen"
          colorClass="text-purple-500"
          bgClass="bg-purple-500/10 border-purple-500/20"
        />

        <StatCard
          title="Active Subs"
          value={activeSubsCount.toLocaleString('en-IN')}
          subtext="Pro & Reader Plans"
          iconName="Flame"
          colorClass="text-amber-500"
          bgClass="bg-amber-500/10 border-amber-500/20"
        />

        <StatCard
          title="Pending Refunds"
          value={pendingRefundsCount.toLocaleString('en-IN')}
          subtext="Failed Transactions"
          iconName="Clock"
          colorClass="text-red-500"
          bgClass="bg-red-500/10 border-red-500/20"
        />
      </div>

      {/* Unified Action Required Widget */}
      <div className="p-6 rounded-3xl bg-theme-card border border-theme glass-card shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <h2 className="text-base font-extrabold text-theme-heading font-montserrat">
              ⚡ Action Required Right Now
            </h2>
          </div>
          <span className="text-xs text-theme-muted font-bold font-mono">
            {pendingAuthorApps + pendingSubmissions + pendingPayouts + pendingDmcaCount + unreadContactCount} Items Pending
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <Link
            href="/admin/applications"
            className="p-4 rounded-2xl bg-theme-surface border border-theme hover:border-amber-500/50 transition-all flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between text-xs text-theme-muted font-bold">
              <span>Author Apps</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${pendingAuthorApps > 0 ? 'bg-amber-500/10 text-amber-500 font-extrabold' : 'bg-slate-500/10 text-slate-400'}`}>
                {pendingAuthorApps}
              </span>
            </div>
            <p className="text-xs font-semibold text-theme-heading group-hover:text-amber-500 mt-2">
              Review Creator Apps →
            </p>
          </Link>

          <Link
            href="/admin/submissions"
            className="p-4 rounded-2xl bg-theme-surface border border-theme hover:border-blue-500/50 transition-all flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between text-xs text-theme-muted font-bold">
              <span>Book Submissions</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${pendingSubmissions > 0 ? 'bg-blue-500/10 text-blue-500 font-extrabold' : 'bg-slate-500/10 text-slate-400'}`}>
                {pendingSubmissions}
              </span>
            </div>
            <p className="text-xs font-semibold text-theme-heading group-hover:text-blue-500 mt-2">
              Approve Manuscripts →
            </p>
          </Link>

          <Link
            href="/admin/payouts"
            className="p-4 rounded-2xl bg-theme-surface border border-theme hover:border-emerald-500/50 transition-all flex flex-col justify-between group relative"
          >
            {stalePayoutsCount > 0 && (
              <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-rose-600 text-white text-[9px] font-black animate-bounce shadow-md">
                {stalePayoutsCount} STALE 7+ DAYS!
              </span>
            )}
            <div className="flex items-center justify-between text-xs text-theme-muted font-bold">
              <span>Payout Requests</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${pendingPayouts > 0 ? 'bg-emerald-500/10 text-emerald-500 font-extrabold' : 'bg-slate-500/10 text-slate-400'}`}>
                {pendingPayouts}
              </span>
            </div>
            <p className="text-xs font-semibold text-theme-heading group-hover:text-emerald-500 mt-2">
              Process Author Funds →
            </p>
          </Link>

          <Link
            href="/admin/dmca"
            className="p-4 rounded-2xl bg-theme-surface border border-theme hover:border-rose-500/50 transition-all flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between text-xs text-theme-muted font-bold">
              <span>DMCA Reports</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${pendingDmcaCount > 0 ? 'bg-rose-500/10 text-rose-500 font-extrabold' : 'bg-slate-500/10 text-slate-400'}`}>
                {pendingDmcaCount}
              </span>
            </div>
            <p className="text-xs font-semibold text-theme-heading group-hover:text-rose-500 mt-2">
              Inspect Notices →
            </p>
          </Link>

          <Link
            href="/admin/contact"
            className="p-4 rounded-2xl bg-theme-surface border border-theme hover:border-purple-500/50 transition-all flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between text-xs text-theme-muted font-bold">
              <span>Unread Support</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${unreadContactCount > 0 ? 'bg-purple-500/10 text-purple-500 font-extrabold' : 'bg-slate-500/10 text-slate-400'}`}>
                {unreadContactCount}
              </span>
            </div>
            <p className="text-xs font-semibold text-theme-heading group-hover:text-purple-500 mt-2">
              View Messages →
            </p>
          </Link>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <RevenueChart data={revenueTrend} />
        </div>
        <div className="lg:col-span-5">
          <TopBooksChart data={topBooks} />
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="p-6 rounded-3xl bg-theme-card border border-theme glass-card space-y-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-theme/60">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-500" />
            <h3 className="text-base font-bold text-theme-heading font-montserrat">Recent Admin Action Logs</h3>
          </div>

          <Link
            href="/admin/logs"
            className="text-xs font-bold text-blue-500 hover:text-blue-400 flex items-center gap-1 transition-colors"
          >
            <span>View All Audit Logs</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {recentLogs.length === 0 ? (
            <p className="text-xs text-theme-muted p-4 text-center">No administrative action logs recorded yet.</p>
          ) : (
            recentLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-2xl bg-theme-surface/50 border border-theme/40 flex items-center justify-between gap-4 text-xs font-semibold"
              >
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-0.5 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20 text-[10px] font-black uppercase font-mono">
                    {log.action}
                  </span>
                  <div>
                    <p className="text-theme-heading font-bold">{log.adminUser?.name || 'Admin User'}</p>
                    <p className="text-[11px] text-theme-muted">
                      Target: {log.targetType} (#{log.targetId})
                    </p>
                  </div>
                </div>

                <span className="text-[11px] text-theme-muted shrink-0" title={formatFullDate(log.createdAt)}>
                  {formatRelativeTime(log.createdAt)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
