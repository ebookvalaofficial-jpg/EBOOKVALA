import React from 'react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import PayoutRequestForm from '@/components/author/PayoutRequestForm';
import { Wallet, Clock, CheckCircle2, XCircle } from 'lucide-react';

export default async function AuthorPayoutsPage() {
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: { email: session?.user?.email! },
  });

  // Calculate Payable Balance
  const payableEntries = await prisma.royaltyLedger.findMany({
    where: { authorUserId: user?.id!, status: 'PAYABLE' },
  });
  const payableBalance = payableEntries.reduce((sum, e) => sum + e.royaltyAmount, 0);

  const requests = await prisma.payoutRequest.findMany({
    where: { authorUserId: user?.id! },
    orderBy: { requestedAt: 'desc' },
  });

  return (
    <div className="space-y-8 font-inter text-theme-text">
      <div>
        <h1 className="text-2xl font-bold text-theme-heading font-montserrat">Payout Requests & History</h1>
        <p className="text-xs text-theme-muted">Track your bank payout requests and processing history.</p>
      </div>

      <PayoutRequestForm payableBalance={payableBalance} />

      <div className="p-6 rounded-3xl bg-theme-card border border-theme glass-card space-y-4 shadow-xl">
        <h3 className="text-base font-bold text-theme-heading font-montserrat">Payout Request History</h3>

        {requests.length === 0 ? (
          <p className="text-xs text-theme-muted p-4 text-center">No payout requests submitted yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold">
              <thead>
                <tr className="border-b border-theme/60 text-theme-muted font-bold text-[11px] uppercase">
                  <th className="pb-3">Requested Date</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Admin Note</th>
                  <th className="pb-3 text-right">Processed Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme/40">
                {requests.map((req) => (
                  <tr key={req.id}>
                    <td className="py-3 text-theme-muted">{new Date(req.requestedAt).toLocaleDateString()}</td>
                    <td className="py-3 font-bold text-emerald-500">₹{req.amount}</td>
                    <td className="py-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1 ${
                          req.status === 'PAID'
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : req.status === 'PROCESSING'
                            ? 'bg-blue-500/10 text-blue-500'
                            : req.status === 'REJECTED'
                            ? 'bg-red-500/10 text-red-500'
                            : 'bg-amber-500/10 text-amber-500'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3 text-theme-muted">{req.adminNote || '—'}</td>
                    <td className="py-3 text-right text-theme-muted">
                      {req.processedAt ? new Date(req.processedAt).toLocaleDateString() : '—'}
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
