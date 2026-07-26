'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Send, Check, ShieldCheck } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [emailError, setEmailError] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      setEmailError(true);
      setTimeout(() => setEmailError(false), 3000);
      return;
    }
    setEmailError(false);
    setSubscribed(true);
    setTimeout(() => {
      setEmail('');
      setSubscribed(false);
    }, 4000);
  };

  return (
    <footer className="bg-[#09090B] text-slate-300 border-t border-slate-800/80 relative overflow-hidden">
      {/* Top Subtle Gradient Line Divider */}
      <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-purple-600 to-amber-400" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-slate-800">
          
          {/* COLUMN 1: Logo + Tagline */}
          <div className="lg:col-span-4 flex flex-col justify-between">
            <div>
              {/* Clickable Logo -> Home Always */}
              <Link
                href="/"
                className="inline-flex items-center gap-3.5 group mb-4 focus:outline-none"
                aria-label="EbookVala Home"
              >
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0">
                  <Image
                    src="/logo.png"
                    alt="EbookVala Logo"
                    fill
                    sizes="64px"
                    className="object-contain drop-shadow-md"
                  />
                </div>
                <span className="font-extrabold text-2xl sm:text-3xl tracking-tight text-white font-montserrat">
                  Ebook<span className="text-blue-500">Vala</span>
                </span>
              </Link>

              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm mb-6">
                EbookVala is the next-generation eBook marketplace empowering over 50,000+ readers 
                with AI-assisted reading, instant summaries, and seamless cloud synchronization across India.
              </p>
            </div>
          </div>

          {/* COLUMN 2: Quick Navigation */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4 font-montserrat">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              <li><Link href="/" className="hover:text-blue-400 transition-colors">Home</Link></li>
              <li><Link href="/books" className="hover:text-blue-400 transition-colors">eBooks Store</Link></li>
              <li><a href="/#categories" className="hover:text-blue-400 transition-colors">Categories</a></li>
              <li><a href="/#trending" className="hover:text-blue-400 transition-colors">Trending Books</a></li>
              <li><a href="/#pricing" className="hover:text-blue-400 transition-colors">Pricing Tiers</a></li>
              <li><Link href="/become-an-author" className="hover:text-blue-400 transition-colors">Publish with Us</Link></li>
            </ul>
          </div>

          {/* COLUMN 3: Resources & Support */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4 font-montserrat">
              Resources & Support
            </h4>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              <li><Link href="/help" className="hover:text-blue-400 transition-colors">Help Center & FAQ</Link></li>
              <li><Link href="/report-a-problem" className="hover:text-blue-400 transition-colors">Report a Bug</Link></li>
              <li><Link href="/feedback" className="hover:text-blue-400 transition-colors">Give Feedback</Link></li>
              <li><Link href="/status" className="hover:text-blue-400 transition-colors flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> System Status</Link></li>
              <li><Link href="/newsletter" className="hover:text-blue-400 transition-colors">Weekly Digest</Link></li>
              <li><Link href="/careers" className="hover:text-blue-400 transition-colors">Careers</Link></li>
              <li><Link href="/press" className="hover:text-blue-400 transition-colors">Press Kit</Link></li>
            </ul>
          </div>

          {/* COLUMN 4: Legal & Policies */}
          <div className="lg:col-span-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4 font-montserrat flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Legal & Governance
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 font-medium mb-6">
              <Link href="/privacy-policy" className="hover:text-blue-400 transition-colors">Privacy Policy</Link>
              <Link href="/terms-and-conditions" className="hover:text-blue-400 transition-colors">Terms of Service</Link>
              <Link href="/cookie-policy" className="hover:text-blue-400 transition-colors">Cookie Policy</Link>
              <Link href="/refund-policy" className="hover:text-blue-400 transition-colors">Refund Policy</Link>
              <Link href="/disclaimer" className="hover:text-blue-400 transition-colors">Disclaimer</Link>
              <Link href="/copyright-policy" className="hover:text-blue-400 transition-colors">Copyright Policy</Link>
              <Link href="/dmca" className="hover:text-blue-400 transition-colors text-red-400 font-bold">DMCA Takedown</Link>
              <Link href="/sitemap" className="hover:text-blue-400 transition-colors">HTML Sitemap</Link>
            </div>

            {/* Newsletter Form */}
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email for weekly digest..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full bg-slate-900 border rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors ${
                    emailError ? 'border-red-500 focus:border-red-500' : 'border-slate-800 focus:border-blue-500'
                  }`}
                  required
                />
                <button
                  type="submit"
                  className={`absolute right-1.5 top-1.5 bottom-1.5 px-3.5 rounded-lg text-xs font-bold text-white transition-all flex items-center gap-1 ${
                    subscribed ? 'bg-green-600' : emailError ? 'bg-red-600' : 'bg-blue-600 hover:bg-blue-500'
                  }`}
                >
                  {subscribed ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Subscribed!
                    </>
                  ) : emailError ? (
                    'Invalid Email'
                  ) : (
                    <>
                      Join <Send className="w-3 h-3" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* BOTTOM BAR */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} EbookVala Inc. All rights reserved. Built with Next.js 15 & Neon PostgreSQL.</p>
          <div className="flex items-center gap-6 font-medium">
            <Link href="/privacy-policy" className="hover:text-slate-400 transition-colors">Privacy</Link>
            <Link href="/terms-and-conditions" className="hover:text-slate-400 transition-colors">Terms</Link>
            <Link href="/refund-policy" className="hover:text-slate-400 transition-colors">Refunds</Link>
            <Link href="/sitemap" className="hover:text-slate-400 transition-colors">Sitemap</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
