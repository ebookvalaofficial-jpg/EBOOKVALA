import React from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { AlertCircle } from 'lucide-react';

export const metadata = {
  title: 'Disclaimer — EbookVala',
  description: 'Legal disclaimer regarding independent author publication, AI-generated reading summaries, and platform information accuracy on EbookVala.',
};

export default function DisclaimerPage() {
  return (
    <main className="min-h-screen bg-theme-bg text-theme-body font-inter">
      <Navbar />

      <div className="pt-32 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-primary-blue bg-blue-500/10 px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" /> Platform Notice
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-theme-heading font-montserrat mt-4 mb-4">
            Disclaimer
          </h1>
          <p className="text-sm sm:text-base text-theme-muted">
            Important information regarding content accuracy, AI reading assistance, and independent author publications.
          </p>
        </div>

        <div className="p-8 sm:p-12 rounded-3xl bg-theme-card border border-theme glass-card space-y-8 text-sm sm:text-base leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-theme-heading font-montserrat">
              1. General Information Disclaimer
            </h2>
            <p>
              The information and eBooks provided on <strong>EbookVala</strong> are for educational, informational, and entertainment purposes only. Views expressed in published eBooks belong solely to their respective authors and do not necessarily reflect official opinions of EbookVala.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-theme-heading font-montserrat">
              2. AI Reading Assistant Disclaimer
            </h2>
            <p>
              AI Chat with Book, AI Summaries, flashcards, and voice narration features utilize artificial intelligence language models. While designed for high accuracy, AI outputs should be cross-referenced with full original eBook manuscripts. EbookVala is not liable for inadvertent AI hallucinations or interpretation errors.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-theme-heading font-montserrat">
              3. Financial & Legal Advisory Disclaimer
            </h2>
            <p>
              eBooks in Finance, Business, Investing, or Law categories do not constitute certified professional financial, investment, or legal advice. Readers are encouraged to consult licensed advisors before making financial decisions.
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
