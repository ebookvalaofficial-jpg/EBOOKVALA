'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home, ShieldCheck } from 'lucide-react';

interface AdminBreadcrumbsProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function AdminBreadcrumbs({ title, description, action }: AdminBreadcrumbsProps) {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean); // e.g. ['admin', 'orders']

  return (
    <div className="space-y-3">
      {/* Breadcrumb path */}
      <nav className="flex items-center gap-1.5 text-xs font-semibold text-theme-muted font-inter">
        <Link href="/admin" className="hover:text-blue-500 flex items-center gap-1 transition-colors">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
          <span>Admin</span>
        </Link>

        {segments.slice(1).map((seg, idx) => {
          const href = '/' + segments.slice(0, idx + 2).join('/');
          const label = seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ');
          const isLast = idx === segments.length - 2;

          return (
            <React.Fragment key={href}>
              <ChevronRight className="w-3 h-3 text-theme-muted" />
              {isLast ? (
                <span className="text-theme-heading font-bold">{label}</span>
              ) : (
                <Link href={href} className="hover:text-blue-500 transition-colors">
                  {label}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Main Subpage Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-theme-card border border-theme glass-card shadow-sm">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-theme-heading font-montserrat tracking-tight">{title}</h1>
          {description && <p className="text-xs text-theme-muted">{description}</p>}
        </div>

        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
