'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@/components/ThemeProvider';

import OnboardingModal from '@/components/auth/OnboardingModal';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <OnboardingModal />
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
