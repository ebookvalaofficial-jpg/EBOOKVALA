'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Home, LayoutDashboard, BookOpen, Trash2, PlusCircle, BarChart2, Settings, LogOut, Store, Feather } from 'lucide-react';

interface AuthorSidebarProps {
  penName?: string;
  avatarUrl?: string;
  applicationStatus?: string;
}

export default function AuthorSidebar({ penName = 'Author', avatarUrl, applicationStatus = 'APPROVED' }: AuthorSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Dashboard', href: '/author', icon: LayoutDashboard },
    { label: 'My Books', href: '/author/books', icon: BookOpen },
    { label: 'Recycle Bin', href: '/author/recycle-bin', icon: Trash2 },
    { label: 'Publish New Book', href: '/author/books/new', icon: PlusCircle },
    { label: 'Analytics & Royalties', href: '/author/earnings', icon: BarChart2 },
    { label: 'Author Settings', href: '/author/profile', icon: Settings },
  ];

  const initials = penName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const isVerified = applicationStatus === 'APPROVED';

  return (
    <aside className="w-full md:w-64 bg-theme-card border-b md:border-b-0 md:border-r border-theme glass-card p-4 space-y-6 shrink-0 text-theme-text font-inter">
      {/* Brand & Author Avatar Header */}
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

        <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-theme-surface/70 border border-theme/60">
          <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-gradient-to-tr from-amber-500 to-orange-600 text-white font-extrabold flex items-center justify-center text-xs shrink-0 shadow-md">
            {avatarUrl ? (
              <Image src={avatarUrl} alt={penName} fill className="object-cover" />
            ) : (
              initials || 'AU'
            )}
          </div>
          <div className="min-w-0">
            <h2 className="text-xs font-extrabold text-theme-heading font-montserrat truncate">
              {penName}
            </h2>
            <div className="flex items-center gap-1 mt-0.5">
              <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                isVerified ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                AUTHOR
              </span>
            </div>
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

      {/* Sign Out Button */}
      <div className="pt-4 border-t border-theme/40 space-y-2">
        <Link
          href="/books"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-theme-surface/50 border border-theme/40 text-theme-muted hover:text-theme-heading text-xs font-bold transition-colors"
        >
          <Store className="w-4 h-4 text-blue-500" />
          <span>Public Book Store</span>
        </Link>

        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full flex items-center gap-2 px-4 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 text-xs font-bold transition-colors text-left"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
