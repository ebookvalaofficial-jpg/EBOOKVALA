import React from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { Shield, BookOpen, Scale } from 'lucide-react';

export const metadata = {
  title: 'Terms & Conditions — EbookVala',
  description: 'EbookVala Terms and Conditions of Service governing eBook marketplace purchases, author publishing, subscriptions, and acceptable platform use.',
};

export default function TermsAndConditionsPage() {
  return (
    <main className="min-h-screen bg-theme-bg text-theme-body font-inter">
      <Navbar />

      <div className="pt-32 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-primary-blue bg-blue-500/10 px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-primary-blue" /> User Agreement
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-theme-heading font-montserrat mt-4 mb-4">
            Terms & Conditions
          </h1>
          <p className="text-sm sm:text-base text-theme-muted">
            Effective Date: July 26, 2026 • Please read these terms carefully before using EbookVala.
          </p>
        </div>

        <div className="p-8 sm:p-12 rounded-3xl bg-theme-card border border-theme glass-card space-y-8 text-sm sm:text-base leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-theme-heading font-montserrat flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary-blue" /> 1. Acceptance of Terms
            </h2>
            <p>
              By accessing or creating an account on <strong>EbookVala</strong> (&quot;Platform&quot;), you agree to be bound by these Terms &amp; Conditions and all applicable laws of India. If you do not agree with any part of these terms, you must discontinue platform access immediately.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-theme-heading font-montserrat flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary-blue" /> 2. Digital Content License & DRM
            </h2>
            <p>
              When you purchase an eBook on EbookVala, you are granted a limited, personal, non-exclusive, non-transferable, revocable license to access and read the digital book for personal, non-commercial use via our cloud web and mobile app readers.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-theme-body">
              <li>You may NOT resell, redistribute, sub-license, extract, copy, or upload purchased eBooks to external file-sharing platforms.</li>
              <li>Watermarking and Digital Rights Management (DRM) technologies are embedded into digital files to protect author intellectual property.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-theme-heading font-montserrat">
              3. Author Program & Publishing License
            </h2>
            <p>
              Authors publishing on EbookVala retain ownership of their original manuscripts while granting EbookVala a worldwide license to host, display, convert, and distribute the published work. Royalties are calculated at 70% of net sales price after payment processing fees.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-theme-heading font-montserrat">
              4. Pricing, Payments & Tax
            </h2>
            <p>
              All prices listed on EbookVala are in Indian Rupees (INR) unless specified otherwise and are inclusive of applicable Goods and Services Tax (GST). Payments are securely executed via Razorpay.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-theme-heading font-montserrat">
              5. Governing Law & Jurisdiction
            </h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of India. Any legal action or dispute arising under these terms shall be subject to the exclusive jurisdiction of the courts located in Gujarat, India.
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
