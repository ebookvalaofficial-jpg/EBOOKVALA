import React from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import Link from 'next/link';
import { Copyright, ShieldCheck, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Copyright Policy — EbookVala',
  description: 'EbookVala Intellectual Property and Copyright Policy safeguarding author manuscripts and digital rights under the Copyright Act, 1957 of India.',
};

export default function CopyrightPolicyPage() {
  return (
    <main className="min-h-screen bg-theme-bg text-theme-body font-inter">
      <Navbar />

      <div className="pt-32 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-primary-blue bg-blue-500/10 px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5">
            <Copyright className="w-3.5 h-3.5 text-blue-500" /> Intellectual Property Protection
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-theme-heading font-montserrat mt-4 mb-4">
            Copyright Policy
          </h1>
          <p className="text-sm sm:text-base text-theme-muted">
            Protection of author works and intellectual property under the Indian Copyright Act, 1957.
          </p>
        </div>

        <div className="p-8 sm:p-12 rounded-3xl bg-theme-card border border-theme glass-card space-y-8 text-sm sm:text-base leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-theme-heading font-montserrat flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary-blue" /> 1. Author Ownership & Protections
            </h2>
            <p>
              At <strong>EbookVala</strong>, we hold creator intellectual property in the highest regard. All text, cover illustrations, chapter designs, audiobooks, and metadata hosted on EbookVala are protected by copyright laws of India and international treaties.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-theme-heading font-montserrat">
              2. Anti-Piracy & Digital Watermarking
            </h2>
            <p>
              We implement invisible forensic watermarks, account-bound reading tokens, and strict access controls to prevent illegal copying, web scraping, and torrent distribution. Accounts engaged in automated scraping or unauthorized file distribution will be permanently banned and reported to legal authorities.
            </p>
          </section>

          <section className="space-y-3 p-6 rounded-2xl bg-blue-500/10 border border-blue-500/20">
            <h2 className="text-lg font-bold text-theme-heading font-montserrat">
              3. Need to Submit a Copyright Takedown Notice?
            </h2>
            <p className="text-xs sm:text-sm text-theme-body mb-4">
              If you are a copyright owner or authorized representative and believe content hosted on EbookVala infringes upon your copyright, please use our official DMCA Takedown Form.
            </p>
            <Link
              href="/dmca"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all"
            >
              <span>Go to DMCA Request Form</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
