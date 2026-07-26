'use client';

import React, { useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';

interface AdminLayoutClientProps {
  children: React.ReactNode;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
}

export default function AdminLayoutClient({ children, user }: AdminLayoutClientProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text font-inter flex">
      {/* Admin Sidebar */}
      <AdminSidebar user={user} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Main Content Area */}
      <main
        className={`flex-1 transition-all duration-300 min-h-screen p-4 sm:p-6 lg:p-8 ${
          isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
