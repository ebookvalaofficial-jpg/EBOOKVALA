'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Home, BookOpen, Bookmark, Heart, User, Sparkles } from 'lucide-react';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Hide mobile bottom nav inside active eBook reader view to prevent distracting long reading sessions
  if (pathname.startsWith('/reader/')) {
    return null;
  }

  const navItems = [
    {
      label: 'Home',
      href: '/',
      icon: Home,
      isActive: pathname === '/',
    },
    {
      label: 'Store',
      href: '/books',
      icon: BookOpen,
      isActive: pathname.startsWith('/books') && !pathname.includes('/reader/'),
    },
    {
      label: 'Library',
      href: session ? '/dashboard/library' : '/login?callbackUrl=/dashboard/library',
      icon: Bookmark,
      isActive: pathname.startsWith('/dashboard/library') || pathname.startsWith('/dashboard'),
    },
    {
      label: 'Blog',
      href: '/blog',
      icon: Sparkles,
      isActive: pathname.startsWith('/blog'),
    },
    {
      label: session ? 'Profile' : 'Sign In',
      href: session ? '/dashboard/profile' : '/login',
      icon: User,
      isActive: pathname.startsWith('/dashboard/profile') || pathname === '/login' || pathname === '/signup',
    },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80 px-2 py-2 shadow-2xl transition-all">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl min-w-[56px] min-h-[48px] transition-all duration-200 ${
                item.isActive
                  ? 'text-amber-400 bg-amber-500/10 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${item.isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              <span className="text-[10px] tracking-tight mt-1 font-montserrat">{item.label}</span>
              {item.isActive && (
                <span className="w-1 h-1 rounded-full bg-amber-400 mt-0.5 animate-pulse" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
