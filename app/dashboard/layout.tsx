import React from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import DashboardShellClient from './DashboardShellClient';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await auth();

  if (!session || !session.user?.email) {
    redirect('/login?callbackUrl=/dashboard');
  }

  return <DashboardShellClient>{children}</DashboardShellClient>;
}
