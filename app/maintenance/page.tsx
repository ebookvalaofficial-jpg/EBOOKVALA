import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldAlert, ArrowLeft, Mail } from 'lucide-react';

export default function MaintenancePage() {
  return (
    <main className="min-h-screen bg-theme-bg text-theme-body font-inter flex flex-col justify-between items-center p-6 text-center">
      <div className="pt-8">
        <div className="relative w-16 h-16 mx-auto mb-3">
          <Image src="/logo.png" alt="EbookVala" fill sizes="64px" className="object-contain" priority />
        </div>
        <span className="font-extrabold text-2xl tracking-tight text-theme-heading font-montserrat">
          Ebook<span className="text-primary-blue">Vala</span>
        </span>
      </div>

      <div className="max-w-md mx-auto space-y-6 my-auto">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mx-auto shadow-lg">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-theme-heading font-montserrat">
          Site Under Scheduled Maintenance
        </h1>

        <p className="text-sm text-theme-body leading-relaxed font-merriweather">
          EbookVala is currently undergoing planned system upgrades to serve you better. We will be back online shortly!
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/login"
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white brand-gradient-bg shadow-md flex items-center gap-2"
          >
            <span>Admin Sign In</span>
            <ArrowLeft className="w-4 h-4 rotate-180" />
          </Link>

          <a
            href="mailto:support@ebookvala.com"
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-theme-heading bg-slate-100 dark:bg-slate-800 border border-theme flex items-center gap-2"
          >
            <Mail className="w-4 h-4 text-blue-500" />
            <span>Support</span>
          </a>
        </div>
      </div>

      <p className="text-xs text-theme-muted pb-4">
        &copy; {new Date().getFullYear()} EbookVala Inc. All rights reserved.
      </p>
    </main>
  );
}
