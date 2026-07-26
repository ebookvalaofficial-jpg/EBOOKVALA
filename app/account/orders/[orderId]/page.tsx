'use client';

import React, { useState, useEffect, use } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import InvoiceView, { InvoiceData } from '@/components/account/InvoiceView';

interface OrderInvoicePageProps {
  params: Promise<{
    orderId: string;
  }>;
}

export default function OrderInvoicePage({ params }: OrderInvoicePageProps) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.orderId;

  const { data: session, status } = useSession();
  const router = useRouter();

  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/login?callbackUrl=/account/orders/${orderId}`);
    }
  }, [status, router, orderId]);

  useEffect(() => {
    if (status !== 'authenticated') return;

    async function loadInvoice() {
      setIsLoading(true);
      try {
        const res = await fetch('/api/orders');
        if (res.ok) {
          const data = await res.json();
          const found = (data.orders || []).find((o: any) => o.id === orderId || o.razorpayOrderId === orderId);
          if (found) {
            setInvoice({
              id: found.id,
              razorpayOrderId: found.razorpayOrderId,
              razorpayPaymentId: found.razorpayPaymentId,
              status: found.status,
              amount: found.amount,
              discountAmount: found.discountAmount,
              promoCodeApplied: found.promoCodeApplied,
              createdAt: found.createdAt,
              user: {
                name: session?.user?.name,
                email: session?.user?.email || 'customer@ebookvala.com',
              },
              items: found.items.map((it: any) => ({
                id: it.id,
                title: it.title,
                price: it.price,
                quantity: it.quantity,
              })),
            });
          }
        }
      } catch (err) {
        console.error('Error fetching invoice:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadInvoice();
  }, [status, orderId, session]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-theme-bg">
        <div className="w-8 h-8 border-4 border-primary-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-theme-bg text-theme-text flex flex-col justify-between">
        <Navbar />
        <main className="container mx-auto px-4 py-24 text-center">
          <h2 className="text-2xl font-bold text-theme-heading">Invoice Not Found</h2>
          <p className="text-xs text-theme-muted mt-2">The requested order invoice reference could not be located.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text flex flex-col justify-between">
      <Navbar />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <InvoiceView invoice={invoice} />
      </main>

      <Footer />
    </div>
  );
}
