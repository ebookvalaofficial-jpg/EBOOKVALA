import React from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { RefreshCw, CheckCircle2, HelpCircle } from 'lucide-react';

export const metadata = {
  title: 'Refund & Cancellation Policy — EbookVala',
  description: 'EbookVala digital purchase refund rules, 7-day refund guarantee for defective files, and cancellation guidelines for EbookVala Plus subscriptions.',
};

export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen bg-theme-bg text-theme-body font-inter">
      <Navbar />

      <div className="pt-32 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-primary-blue bg-blue-500/10 px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-emerald-500" /> Buyer Protection
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-theme-heading font-montserrat mt-4 mb-4">
            Refund & Cancellation Policy
          </h1>
          <p className="text-sm sm:text-base text-theme-muted">
            Clear, transparent guidelines on digital eBook purchases and subscription cancellations.
          </p>
        </div>

        <div className="p-8 sm:p-12 rounded-3xl bg-theme-card border border-theme glass-card space-y-8 text-sm sm:text-base leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-theme-heading font-montserrat flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" /> 1. Digital Content Refund Rules
            </h2>
            <p>
              Due to the immediate digital nature of eBook access, all single eBook sales on <strong>EbookVala</strong> are generally final once instant reading access is delivered to your account.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-theme-heading font-montserrat flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-primary-blue" /> 2. Eligible Refund Exceptions (7-Day Guarantee)
            </h2>
            <p>We provide a 100% full refund within 7 days of purchase if:</p>
            <ul className="list-disc pl-6 space-y-2 text-theme-body">
              <li>The eBook file is corrupt, incomplete, missing chapters, or unreadable on browser and mobile app.</li>
              <li>Duplicate payment charges occurred due to network timeouts during Razorpay checkout.</li>
              <li>The book content substantially differs from its listed store description.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-theme-heading font-montserrat">
              3. Subscription Cancellations (EbookVala Plus)
            </h2>
            <p>
              You may cancel your EbookVala Plus subscription at any time from your Account Dashboard. Upon cancellation, you retain full library access until the conclusion of your current billing cycle. No further recurring charges will apply.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-theme-heading font-montserrat flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-500" /> 4. How to Request a Refund
            </h2>
            <p>
              To initiate a refund request, visit <a href="/report-a-problem" className="text-primary-blue underline">Report a Problem</a> or email <a href="mailto:ebookvala.official@gmail.com" className="text-primary-blue underline font-bold">ebookvala.official@gmail.com</a> with your Order ID and payment receipt. Eligible refunds are processed back to your original payment method via Razorpay within 5 to 7 business days.
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
