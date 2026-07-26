'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { Search, Bell, Menu, User as UserIcon, Settings, LogOut, Sparkles, Check, ChevronDown } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useRouter } from 'next/navigation';

interface DashboardTopbarProps {
  onOpenMobileMenu: () => void;
}

const sampleNotifications = [
  { id: '1', title: 'Welcome to EbookVala Dashboard!', time: 'Just now', unread: true },
  { id: '2', title: 'New release in AI & Technology category', time: '2 hours ago', unread: true },
  { id: '3', title: 'Streak Bonus: 3-Day Reading Streak active! 🔥', time: '1 day ago', unread: false },
];

export default function DashboardTopbar({ onOpenMobileMenu }: DashboardTopbarProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [notifs, setNotifs] = useState(sampleNotifications);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/dashboard/library?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const unreadCount = notifs.filter((n) => n.unread).length;

  return (
    <header className="sticky top-0 z-20 h-16 bg-theme-card/90 backdrop-blur-md border-b border-theme/60 px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* Left: Mobile Trigger & Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-xl text-theme-heading hover:bg-slate-500/10 border border-theme/60"
          aria-label="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your library or store..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-theme-surface border border-theme/60 text-xs font-semibold text-theme-heading placeholder:text-theme-muted focus:outline-none focus:border-blue-500 transition-colors"
          />
        </form>
      </div>

      {/* Right Controls: Notifications, Dark Mode Toggle, User Menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        <ThemeToggle />

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 rounded-xl text-theme-heading hover:bg-slate-500/10 border border-theme/60 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 p-3 rounded-2xl bg-theme-card border border-theme glass-card shadow-2xl space-y-2 animate-scale-up z-50 text-theme-text" data-lenis-prevent>
              <div className="flex items-center justify-between pb-2 border-b border-theme/60">
                <span className="text-xs font-bold text-theme-heading font-montserrat">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={() => setNotifs(notifs.map((n) => ({ ...n, unread: false })))}
                    className="text-[10px] text-primary-blue font-bold hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="space-y-1 max-h-60 overflow-y-auto">
                {notifs.map((n) => (
                  <div
                    key={n.id}
                    className={`p-2.5 rounded-xl border text-xs transition-colors ${
                      n.unread ? 'bg-blue-500/10 border-blue-500/30' : 'bg-theme-surface border-theme/40 text-theme-muted'
                    }`}
                  >
                    <p className="font-semibold text-theme-heading">{n.title}</p>
                    <span className="text-[10px] text-theme-muted mt-1 block">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar Menu */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 p-1 rounded-2xl border border-theme/60 hover:bg-slate-500/10 transition-colors"
          >
            <div className="relative w-8 h-8 rounded-xl overflow-hidden bg-blue-600 text-white font-black flex items-center justify-center text-xs">
              {session?.user?.image ? (
                <Image src={session.user.image} alt={session.user.name || 'User'} fill unoptimized className="object-cover" />
              ) : (
                session?.user?.name?.[0]?.toUpperCase() || 'U'
              )}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-theme-muted hidden sm:block pr-1" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 p-2 rounded-2xl bg-theme-card border border-theme glass-card shadow-2xl space-y-1 animate-scale-up z-50 text-theme-text" data-lenis-prevent>
              <div className="px-3 py-2 border-b border-theme/60">
                <p className="text-xs font-bold text-theme-heading truncate">{session?.user?.name || 'User'}</p>
                <p className="text-[10px] text-theme-muted truncate">{session?.user?.email}</p>
              </div>

              <Link
                href="/dashboard/settings"
                onClick={() => setIsUserMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-theme-heading hover:bg-slate-500/10 transition-colors"
              >
                <UserIcon className="w-4 h-4 text-primary-blue" />
                <span>Profile & Account</span>
              </Link>

              <Link
                href="/dashboard/settings"
                onClick={() => setIsUserMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-theme-heading hover:bg-slate-500/10 transition-colors"
              >
                <Settings className="w-4 h-4 text-theme-muted" />
                <span>Preferences</span>
              </Link>

              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
