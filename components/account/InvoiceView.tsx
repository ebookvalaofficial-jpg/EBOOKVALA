'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Printer, ArrowLeft, CheckCircle2, ShieldCheck, Download } from 'lucide-react';

export interface InvoiceData {
  id: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string | null;
  status: string;
  amount: number; // in paise
  discountAmount?: number | null; // in INR
  promoCodeApplied?: string | null;
  createdAt: string;
  user: {
    name?: string | null;
    email: string;
  };
  items: Array<{
    id: string;
    title: string;
    price: number;
    quantity: number;
  }>;
}

interface InvoiceViewProps {
  invoice: InvoiceData;
}

export default function InvoiceView({ invoice }: InvoiceViewProps) {
  const amountINR = Math.round(invoice.amount / 100);
  const discountINR = invoice.discountAmount || 0;
  const grossSubtotalINR = invoice.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Controls */}
      <div className="flex items-center justify-between print:hidden">
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-2 text-xs font-bold text-theme-muted hover:text-theme-heading transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Order History
        </Link>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white brand-gradient-bg shadow-md hover:shadow-lg transition-all"
        >
          <Printer className="w-4 h-4" /> Print / Download Invoice
        </button>
      </div>

      {/* Invoice Card Container */}
      <div className="p-8 sm:p-12 rounded-3xl bg-theme-card border border-theme glass-card shadow-lg print:shadow-none print:border-none print:bg-white print:text-black">
        {/* Invoice Header */}
        <div className="flex items-start justify-between pb-8 border-b border-theme/60">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl brand-gradient-bg flex items-center justify-center text-white font-extrabold text-lg shadow-md">
                E
              </div>
              <span className="text-xl font-extrabold text-theme-heading tracking-tight font-montserrat print:text-black">
                EbookVala
              </span>
            </div>
            <p className="text-xs text-theme-muted mt-2 print:text-slate-600">
              Turn Every Page. Into Real Progress.
            </p>
            <p className="text-xs text-theme-muted print:text-slate-600">
              Support: support@ebookvala.com
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs font-extrabold uppercase tracking-widest text-primary-blue block">
              Official Tax Invoice
            </span>
            <h2 className="text-lg font-bold text-theme-heading font-mono mt-1 print:text-black">
              #{invoice.id.substring(0, 10).toUpperCase()}
            </h2>
            <span className="text-xs text-theme-muted block mt-1 print:text-slate-600">
              Date: {new Date(invoice.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* Customer & Order Reference Metadata */}
        <div className="grid grid-cols-2 gap-6 py-6 border-b border-theme/60 text-xs">
          <div>
            <span className="font-extrabold text-theme-muted uppercase tracking-wider block mb-1 print:text-slate-500">
              Billed To
            </span>
            <p className="font-bold text-theme-heading text-sm print:text-black">
              {invoice.user.name || 'Valued Reader'}
            </p>
            <p className="text-theme-muted print:text-slate-600">{invoice.user.email}</p>
          </div>

          <div className="text-right">
            <span className="font-extrabold text-theme-muted uppercase tracking-wider block mb-1 print:text-slate-500">
              Payment Reference
            </span>
            <p className="font-mono text-theme-heading print:text-black">
              Razorpay Order: {invoice.razorpayOrderId}
            </p>
            {invoice.razorpayPaymentId && (
              <p className="font-mono text-theme-muted print:text-slate-600">
                Payment ID: {invoice.razorpayPaymentId}
              </p>
            )}
            <span className="inline-flex items-center gap-1 mt-1 text-emerald-500 font-bold uppercase text-[10px]">
              <CheckCircle2 className="w-3 h-3" /> Status: {invoice.status}
            </span>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="py-6">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-theme/60 text-theme-muted font-extrabold uppercase tracking-wider text-[10px] print:text-slate-600">
                <th className="pb-3">Item Description</th>
                <th className="pb-3 text-center">Qty</th>
                <th className="pb-3 text-right">Unit Price</th>
                <th className="pb-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme/40 text-theme-heading print:text-black font-semibold">
              {invoice.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-3.5 pr-4 font-montserrat">{item.title}</td>
                  <td className="py-3.5 px-2 text-center">{item.quantity}</td>
                  <td className="py-3.5 pl-2 text-right font-stats">₹{item.price.toLocaleString()}</td>
                  <td className="py-3.5 pl-2 text-right font-stats">₹{(item.price * item.quantity).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Summary */}
        <div className="pt-4 border-t border-theme/60 flex flex-col items-end text-xs space-y-2">
          <div className="w-64 flex items-center justify-between text-theme-muted print:text-slate-600">
            <span>Gross Subtotal</span>
            <span className="font-stats font-semibold">₹{grossSubtotalINR.toLocaleString()}</span>
          </div>

          {discountINR > 0 && (
            <div className="w-64 flex items-center justify-between text-emerald-500 font-semibold">
              <span>Promo Discount ({invoice.promoCodeApplied})</span>
              <span className="font-stats">-₹{discountINR.toLocaleString()}</span>
            </div>
          )}

          <div className="w-64 flex items-center justify-between pt-3 border-t border-theme/60 text-base font-extrabold text-theme-heading print:text-black">
            <span>Total Paid</span>
            <span className="text-primary-blue text-xl font-stats">₹{amountINR.toLocaleString()}</span>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-12 pt-6 border-t border-theme/60 text-center text-xs text-theme-muted print:text-slate-500 space-y-1">
          <p className="font-bold">Thank you for choosing EbookVala!</p>
          <p>This is a computer-generated tax invoice and requires no physical signature.</p>
        </div>
      </div>
    </div>
  );
}
