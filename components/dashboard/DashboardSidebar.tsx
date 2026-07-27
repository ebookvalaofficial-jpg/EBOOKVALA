'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  LayoutDashboard,
  BookOpen,
  Heart,
  Highlighter,
  BarChart3,
  Trophy,
  ShoppingCart,
  ShoppingBag,
  Sparkles,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X,
  Users,
} from 'lucide-react';
import { signOut } from 'next-auth/react';

export const dashboardNavItems = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'My Library', href: '/dashboard/library', icon: BookOpen },
  { label: 'My Cart', href: '/cart', icon: ShoppingCart },
  { label: 'Reading Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { label: 'Notes Workspace', href: '/dashboard/notes', icon: Highlighter },
  { label: 'Reading Goals', href: '/dashboard/goals', icon: Sparkles },
  { label: 'Leaderboard & XP', href: '/dashboard/leaderboard', icon: Trophy },
  { label: 'My Reading Groups', href: '/community/clubs', icon: Users },
  { label: 'Community Discussions', href: '/community/discussions', icon: ShoppingBag },
  { label: 'Social Activity Feed', href: '/community', icon: Heart },
  { label: 'Browse Store', href: '/books', icon: ShoppingBag },
  { label: 'Settings & Profile', href: '/dashboard/settings', icon: Settings },
];

interface DashboardSidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function DashboardSidebar({ isMobileOpen = false, onCloseMobile }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between p-4 text-theme-text">
      {/* Top Header & Logo */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-9 h-9 overflow-hidden rounded-xl bg-slate-900 border border-slate-700/50 shadow-md group-hover:scale-105 transition-transform shrink-0">
              <Image
                src="/logo.png"
                alt="EbookVala Logo"
                fill
                sizes="36px"
                className="object-contain p-0.5"
                priority
              />
            </div>
            {!isCollapsed && (
              <span className="text-lg font-black text-theme-heading font-montserrat tracking-tight">
                Ebook<span className="text-primary-blue">Vala</span>
              </span>
            )}
          </Link>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex p-1.5 rounded-lg text-theme-muted hover:text-theme-heading hover:bg-slate-500/10 transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile Close */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-lg text-theme-muted hover:text-theme-heading hover:bg-slate-500/10"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation List */}
        <nav className="space-y-1">
          {dashboardNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl font-bold text-xs transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-theme-muted hover:text-theme-heading hover:bg-slate-500/10'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-theme-muted'}`} />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Sign Out */}
      <div className="pt-4 border-t border-theme/60">
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl font-bold text-xs text-rose-500 hover:bg-rose-500/10 transition-colors ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title={isCollapsed ? 'Sign Out' : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:block sticky top-0 h-screen bg-theme-card border-r border-theme glass-card transition-all duration-300 z-30 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex" data-lenis-prevent>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onCloseMobile} />
          <div className="relative w-72 max-w-[80vw] h-full bg-theme-card border-r border-theme shadow-2xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
