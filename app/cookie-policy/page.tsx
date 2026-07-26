import React from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { Cookie, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Cookie Policy — EbookVala',
  description: 'Learn how EbookVala uses essential cookies, authentication session tokens, and performance preferences to deliver a seamless eBook reading experience.',
};

export default function CookiePolicyPage() {
  return (
    <main className="min-h-screen bg-theme-bg text-theme-body font-inter">
      <Navbar />

      <div className="pt-32 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-primary-blue bg-blue-500/10 px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5">
            <Cookie className="w-3.5 h-3.5 text-amber-500" /> Web Telemetry
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-theme-heading font-montserrat mt-4 mb-4">
            Cookie Policy
          </h1>
          <p className="text-sm sm:text-base text-theme-muted">
            Transparent breakdown of essential cookies and local storage tokens used on EbookVala.
          </p>
        </div>

        <div className="p-8 sm:p-12 rounded-3xl bg-theme-card border border-theme glass-card space-y-8 text-sm sm:text-base leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-theme-heading font-montserrat flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary-blue" /> 1. What Are Cookies?
            </h2>
            <p>
              Cookies are small text files placed on your computer or mobile device when you visit websites. On <strong>EbookVala</strong>, we use essential cookies and local browser storage to keep you signed in, remember your reading progress, and maintain dark/light mode preferences.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-theme-heading font-montserrat">
              2. Categories of Cookies We Use
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-theme-body">
              <li><strong>Essential Auth Cookies (NextAuth.js):</strong> Secure session tokens (`__Secure-next-auth.session-token`) required to authenticate logged-in readers and authors.</li>
              <li><strong>Preference Storage:</strong> LocalStorage keys used to remember reader font size, line height, dark mode state, and offline PWA data.</li>
              <li><strong>Analytical Cookies:</strong> Privacy-preserving metrics used to monitor website performance and page load speeds.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-theme-heading font-montserrat">
              3. Managing Cookie Preferences
            </h2>
            <p>
              Most web browsers allow you to control cookie settings through browser preferences. Disabling essential session cookies may prevent you from signing into your EbookVala library or accessing purchased eBooks.
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
