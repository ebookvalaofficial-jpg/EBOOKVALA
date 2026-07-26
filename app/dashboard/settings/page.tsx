import React from 'react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ProfileForm from '@/components/dashboard/ProfileForm';
import AccountSecurityForm from '@/components/dashboard/AccountSecurityForm';
import NotificationPreferences from '@/components/dashboard/NotificationPreferences';
import { Settings } from 'lucide-react';

export default async function SettingsPage() {
  const session = await auth();

  const user = await prisma.user.findUnique({
    where: { email: session!.user!.email! },
    include: {
      notificationPreference: true,
      accounts: { select: { provider: true } },
    },
  });

  if (!user) return null;

  const connectedAccounts = user.accounts.map((a) => a.provider);
  if (user.provider && !connectedAccounts.includes(user.provider)) {
    connectedAccounts.push(user.provider);
  }

  const notifications = user.notificationPreference || {
    emailNewReleases: true,
    emailReadingReminders: true,
    emailPromotions: false,
    emailOrderReceipts: true,
    pushEnabled: true,
  };

  return (
    <div className="space-y-8 text-theme-text max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-theme-heading font-montserrat flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary-blue" />
          <span>Account Settings & Preferences</span>
        </h1>
        <p className="text-xs text-theme-muted">
          Manage your public profile, account security, and notification delivery options.
        </p>
      </div>

      <div className="space-y-8">
        <ProfileForm user={user} />
        <AccountSecurityForm
          provider={user.provider || 'credentials'}
          connectedAccounts={connectedAccounts}
          hasPassword={Boolean(user.password)}
        />
        <NotificationPreferences initialNotifications={notifications} />
      </div>
    </div>
  );
}
