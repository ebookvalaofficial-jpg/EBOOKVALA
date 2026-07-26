import React from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import FAQ from '@/components/landing/FAQ';
import Link from 'next/link';
import { HelpCircle, User, CreditCard, BookOpen, PenTool, MessageSquare, AlertTriangle } from 'lucide-react';

export const metadata = {
  title: 'Help Center & Knowledge Base — EbookVala',
  description: 'Find instant answers to common questions about your account, eBook reader, payments, AI features, and author submissions.',
};

export default function HelpCenterPage() {
  const categories = [
    { name: 'Account & Profile', icon: User, desc: 'Login issues, password reset, and profile settings' },
    { name: 'Payments & Orders', icon: CreditCard, desc: 'Razorpay billing, invoices, and 7-day refund policy' },
    { name: 'Reading & AI Features', icon: BookOpen, desc: 'AI Chat with Book, highlights, audiobooks, and sync' },
    { name: 'Author Program', icon: PenTool, desc: 'Manuscript submission, publishing royalties, and payouts' },
  ];

  return (
    <main className="min-h-screen bg-theme-bg text-theme-body font-inter">
      <Navbar />

      <div className="pt-32 pb-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-primary-blue bg-blue-500/10 px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-primary-blue" /> Support Hub
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-theme-heading font-montserrat mt-4 mb-4">
            How Can We Help You Today?
          </h1>
          <p className="text-sm sm:text-base text-theme-muted max-w-xl mx-auto">
            Search our knowledge base or browse help topics below to find instant solutions.
          </p>
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div key={cat.name} className="p-6 rounded-3xl bg-theme-card border border-theme glass-card hover:border-blue-500/50 transition-all cursor-pointer group">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-primary-blue flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-theme-heading font-montserrat mb-1 group-hover:text-primary-blue transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-theme-muted leading-relaxed">{cat.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Dedicated Support Action Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16">
          <div className="p-6 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between gap-4">
            <div>
              <h4 className="text-base font-bold text-theme-heading font-montserrat">Facing a Technical Bug?</h4>
              <p className="text-xs text-theme-muted mt-1">Submit a problem report with auto-captured device telemetry.</p>
            </div>
            <Link href="/report-a-problem" className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shrink-0 transition-colors flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Report Issue
            </Link>
          </div>

          <div className="p-6 rounded-3xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between gap-4">
            <div>
              <h4 className="text-base font-bold text-theme-heading font-montserrat">Have Feedback for Us?</h4>
              <p className="text-xs text-theme-muted mt-1">Rate your reading experience and share feature ideas.</p>
            </div>
            <Link href="/feedback" className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shrink-0 transition-colors flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" /> Give Feedback
            </Link>
          </div>
        </div>
      </div>

      {/* Embedded FAQ Section */}
      <FAQ />

      <Footer />
    </main>
  );
}
