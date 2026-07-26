import React from 'react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import EarningsChart from '@/components/author/EarningsChart';
import PayoutRequestForm from '@/components/author/PayoutRequestForm';
import { DollarSign, Clock, CheckCircle2, Wallet } from 'lucide-react';

export default async function AuthorEarningsPage() {
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: { email: session?.user?.email! },
  });

  // Auto-transition entries > 14 days to PAYABLE
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  await prisma.royaltyLedger.updateMany({
    where: {
      authorUserId: user?.id!,
      status: 'PENDING',
      createdAt: { lte: fourteenDaysAgo },
    },
    data: { status: 'PAYABLE' },
  });

  const entries = await prisma.royaltyLedger.findMany({
    where: { authorUserId: user?.id! },
    include: { book: { select: { title: true } } },
    orderBy: { createdAt: 'desc' },
  });

  let pendingSum = 0;
  let payableSum = 0;
  let paidSum = 0;

  entries.forEach((e) => {
    if (e.status === 'PENDING') pendingSum += e.royaltyAmount;
    if (e.status === 'PAYABLE') payableSum += e.royaltyAmount;
    if (e.status === 'PAID') paidSum += e.royaltyAmount;
  });

  return (
    <div className="space-y-8 font-inter text-theme-text">
      <div>
        <h1 className="text-2xl font-bold text-theme-heading font-montserrat">Royalties & Earnings</h1>
        <p className="text-xs text-theme-muted">
          Transparent 70% royalty ledger tracking across all your published eBooks.
        </p>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-theme-card border border-theme glass-card space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-theme-muted">
            <span className="text-xs font-bold">Pending Holdback (14 Days)</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-theme-heading font-stats">₹{pendingSum}</div>
        </div>

        <div className="p-6 rounded-3xl bg-theme-card border border-theme glass-card space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-theme-muted">
            <span className="text-xs font-bold">Available Payable Balance</span>
            <Wallet className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-500 font-stats">₹{payableSum}</div>
        </div>

        <div className="p-6 rounded-3xl bg-theme-card border border-theme glass-card space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-theme-muted">
            <span className="text-xs font-bold">Total Paid Out</span>
            <CheckCircle2 className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-theme-heading font-stats">₹{paidSum}</div>
        </div>
      </div>

      {/* Request Payout Form */}
      <PayoutRequestForm payableBalance={payableSum} />

      {/* Chart */}
      <div className="p-6 rounded-3xl bg-theme-card border border-theme glass-card space-y-4 shadow-xl">
        <h3 className="text-base font-bold text-theme-heading font-montserrat">Earnings Breakdown Chart</h3>
        <EarningsChart entries={entries.map((e) => ({ createdAt: e.createdAt.toISOString(), royaltyAmount: e.royaltyAmount }))} />
      </div>

      {/* Detailed Ledger Table */}
      <div className="p-6 rounded-3xl bg-theme-card border border-theme glass-card space-y-4 shadow-xl">
        <h3 className="text-base font-bold text-theme-heading font-montserrat">Royalty Transaction Log</h3>

        {entries.length === 0 ? (
          <p className="text-xs text-theme-muted p-4 text-center">No sales transactions logged yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold">
              <thead>
                <tr className="border-b border-theme/60 text-theme-muted font-bold text-[11px] uppercase">
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Book</th>
                  <th className="pb-3">Sale Price</th>
                  <th className="pb-3">Royalty (70%)</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme/40">
                {entries.map((entry) => (
                  <tr key={entry.id}>
                    <td className="py-3 text-theme-muted">{new Date(entry.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 font-bold text-theme-heading">{entry.book?.title || 'eBook'}</td>
                    <td className="py-3">₹{entry.saleAmount}</td>
                    <td className="py-3 font-bold text-amber-500">₹{entry.royaltyAmount}</td>
                    <td className="py-3 text-right">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          entry.status === 'PAID'
                            ? 'bg-blue-500/10 text-blue-500'
                            : entry.status === 'PAYABLE'
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : 'bg-amber-500/10 text-amber-500'
                        }`}
                      >
                        {entry.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
