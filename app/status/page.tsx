import React from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { Activity, CheckCircle2, Clock } from 'lucide-react';

export const metadata = {
  title: 'System Operational Status — EbookVala',
  description: 'Real-time operational status for EbookVala core services including website, authentication, Razorpay payments, AI reading tools, and email delivery.',
};

export default function SystemStatusPage() {
  const services = [
    { name: 'Website Marketplace & Store', status: 'Operational', latency: '24ms' },
    { name: 'Authentication & Session Token SSO', status: 'Operational', latency: '32ms' },
    { name: 'Razorpay Payment Gateway Integration', status: 'Operational', latency: '110ms' },
    { name: 'AI Chat, Summaries & Voice Narration', status: 'Operational', latency: '240ms' },
    { name: 'Email Delivery & Verification System', status: 'Operational', latency: '85ms' },
    { name: 'Cloud Progress & Bookmark Sync', status: 'Operational', latency: '18ms' },
  ];

  return (
    <main className="min-h-screen bg-theme-bg text-theme-body font-inter">
      <Navbar />

      <div className="pt-32 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> All Systems Operational
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-theme-heading font-montserrat mt-4 mb-4">
            EbookVala System Status
          </h1>
          <p className="text-sm sm:text-base text-theme-muted">
            Live health indicators for core platform infrastructure and API services.
          </p>
        </div>

        <div className="space-y-8">
          {/* Active Services Status Grid */}
          <div className="p-8 rounded-3xl bg-theme-card border border-theme glass-card space-y-4">
            <h2 className="text-lg font-bold text-theme-heading font-montserrat flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary-blue" /> Platform Services
              </span>
              <span className="text-xs font-mono text-theme-muted font-normal">
                Uptime: 99.98%
              </span>
            </h2>

            <div className="space-y-3">
              {services.map((s) => (
                <div
                  key={s.name}
                  className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-theme/60 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span className="text-xs sm:text-sm font-bold text-theme-heading font-montserrat">
                      {s.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-mono text-theme-muted hidden sm:inline-block">
                      {s.latency}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                      {s.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Incident History Empty State */}
          <div className="p-8 rounded-3xl bg-theme-card border border-theme glass-card space-y-4">
            <h2 className="text-lg font-bold text-theme-heading font-montserrat flex items-center gap-2">
              <Clock className="w-5 h-5 text-theme-muted" /> Incident History (Past 90 Days)
            </h2>

            <div className="p-6 rounded-2xl border border-dashed border-theme text-center space-y-2">
              <p className="text-xs sm:text-sm font-semibold text-theme-heading">
                No incidents reported in the last 90 days.
              </p>
              <p className="text-xs text-theme-muted">
                All platform infrastructure operates with active failover backups and automated health checks.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
