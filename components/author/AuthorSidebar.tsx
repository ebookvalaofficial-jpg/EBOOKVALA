'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BookOpen, DollarSign, Wallet, UserCheck, Store, Feather } from 'lucide-react';

interface AuthorSidebarProps {
  penName?: string;
}

export default function AuthorSidebar({ penName = 'Author' }: AuthorSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Overview', href: '/author', icon: LayoutDashboard },
    { label: 'My Submissions', href: '/author/books', icon: BookOpen },
    { label: 'Royalties & Earnings', href: '/author/earnings', icon: DollarSign },
    { label: 'Payout Requests', href: '/author/payouts', icon: Wallet },
    { label: 'Author Profile', href: '/author/profile', icon: UserCheck },
  ];

  return (
    <aside className="w-full md:w-64 bg-theme-card border-b md:border-b-0 md:border-r border-theme glass-card p-4 space-y-6 shrink-0 text-theme-text font-inter">
      {/* Brand Header */}
      <div className="space-y-4">
        <Link href="/" className="flex items-center gap-2.5 px-2 group">
          <div className="relative w-8 h-8 overflow-hidden rounded-xl bg-slate-900 border border-slate-700/50 shadow-md group-hover:scale-105 transition-transform shrink-0">
            <Image
              src="/logo.png"
              alt="EbookVala Logo"
              fill
              sizes="32px"
              className="object-contain p-0.5"
            />
          </div>
          <span className="text-base font-black text-theme-heading font-montserrat tracking-tight">
            Ebook<span className="text-primary-blue">Vala</span>
          </span>
        </Link>

        <div className="flex items-center gap-3 px-2 py-2 rounded-2xl bg-theme-surface/50 border border-theme/40">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white shadow-md shrink-0">
            <Feather className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xs font-extrabold text-theme-heading font-montserrat truncate">
              {penName}
            </h2>
            <span className="text-[9px] font-black uppercase text-amber-500 tracking-wider block">
              Verified Author
            </span>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-amber-500 text-white shadow-md font-extrabold'
                  : 'text-theme-muted hover:text-theme-heading hover:bg-theme-surface/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Public Store Link */}
      <div className="pt-4 border-t border-theme/40">
        <Link
          href="/books"
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-theme-surface/50 border border-theme/40 text-theme-muted hover:text-theme-heading text-xs font-bold transition-colors"
        >
          <Store className="w-4 h-4 text-blue-500" />
          <span>Public Book Store</span>
        </Link>
      </div>
    </aside>
  );
}
