'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ShoppingBag,
  MessageSquare,
  Ticket,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Store,
  PenTool,
  FolderTree,
  UserCheck,
  FileCheck,
  Wallet,
  Flag,
  Trophy,
} from 'lucide-react';
import UserRoleBadge from './UserRoleBadge';

interface AdminSidebarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const navItems = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/books', label: 'Books', icon: BookOpen },
  { href: '/admin/authors', label: 'Authors', icon: PenTool },
  { href: '/admin/categories', label: 'Categories', icon: FolderTree },
  { href: '/admin/author-applications', label: 'Author Applicants', icon: UserCheck },
  { href: '/admin/book-submissions', label: 'Book Submissions', icon: FileCheck },
  { href: '/admin/payouts', label: 'Payout Requests', icon: Wallet },
  { href: '/admin/community/reports', label: 'Community Reports', icon: Flag },
  { href: '/admin/community/discussions', label: 'Mod Discussions', icon: MessageSquare },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/gamification', label: 'Gamification & XP', icon: Trophy },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/reviews', label: 'Reviews', icon: MessageSquare },
  { href: '/admin/promo-codes', label: 'Promo Codes', icon: Ticket },
  { href: '/admin/logs', label: 'Audit Logs', icon: ShieldCheck },
];

export default function AdminSidebar({ user, isCollapsed, setIsCollapsed }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 z-40 bg-theme-card border-r border-theme glass-card transition-all duration-300 flex flex-col ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header / Brand */}
      <div className="p-4 border-b border-theme/60 flex items-center justify-between">
        {!isCollapsed && (
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-black flex items-center justify-center text-sm shadow-md">
              E
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-theme-heading font-montserrat">
                Ebook<span className="text-blue-500">Vala</span>
              </span>
              <p className="text-[10px] font-bold text-amber-500 tracking-wider uppercase">Admin Portal</p>
            </div>
          </Link>
        )}

        {isCollapsed && (
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-black flex items-center justify-center text-sm mx-auto shadow-md">
            A
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-xl border border-theme/60 hover:bg-slate-500/10 text-theme-muted hover:text-theme-heading transition-colors hidden lg:block"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-theme-muted hover:text-theme-heading hover:bg-slate-500/10'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer Profile & Store Return */}
      <div className="p-3 border-t border-theme/60 space-y-2">
        <Link
          href="/"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold border border-theme/60 text-theme-heading hover:bg-slate-500/10 transition-colors ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title="Return to Main Store"
        >
          <Store className="w-4 h-4 text-blue-500 shrink-0" />
          {!isCollapsed && <span>Return to Store</span>}
        </Link>

        {!isCollapsed && user && (
          <div className="p-3 rounded-2xl bg-theme-surface/50 border border-theme/40 space-y-1">
            <p className="text-xs font-bold text-theme-heading truncate">{user.name || 'Admin User'}</p>
            <UserRoleBadge role={user.role} />
          </div>
        )}
      </div>
    </aside>
  );
}
