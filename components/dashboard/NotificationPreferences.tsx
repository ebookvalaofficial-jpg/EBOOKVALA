'use client';

import React, { useState } from 'react';
import { BellRing, Check, AlertCircle } from 'lucide-react';

export interface NotificationState {
  emailNewReleases: boolean;
  emailReadingReminders: boolean;
  emailPromotions: boolean;
  emailOrderReceipts: boolean;
  pushEnabled: boolean;
}

interface NotificationPreferencesProps {
  initialNotifications: NotificationState;
}

export default function NotificationPreferences({
  initialNotifications,
}: NotificationPreferencesProps) {
  const [notifs, setNotifs] = useState<NotificationState>(initialNotifications);
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const toggleKey = (key: keyof NotificationState) => {
    if (key === 'emailOrderReceipts') return; // Always on for transactional receipts
    setNotifs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMsg(null);

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notifications: notifs }),
      });

      if (res.ok) {
        setMsg('Notification preferences saved!');
        setTimeout(() => setMsg(null), 3000);
      }
    } catch (err) {
      console.error('Error saving notification preferences:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleItems: Array<{
    key: keyof NotificationState;
    label: string;
    description: string;
    locked?: boolean;
  }> = [
    {
      key: 'emailNewReleases',
      label: 'New Releases & Book Recommendations',
      description: 'Receive weekly updates on trending eBooks and top author releases.',
    },
    {
      key: 'emailReadingReminders',
      label: 'Daily Reading Reminders & Streak Alerts',
      description: 'Get gentle reminders to maintain your active reading streak.',
    },
    {
      key: 'emailPromotions',
      label: 'Promotions, Discounts & Sales',
      description: 'Exclusive promo code announcements and seasonal store sales.',
    },
    {
      key: 'emailOrderReceipts',
      label: 'Order Receipts & Purchase Invoices',
      description: 'Instant transactional order receipts (Required for all purchases).',
      locked: true,
    },
    {
      key: 'pushEnabled',
      label: 'In-App Browser Push Notifications',
      description: 'Receive real-time reading progress & achievement milestone alerts.',
    },
  ];

  return (
    <div className="p-6 rounded-3xl bg-theme-card border border-theme glass-card space-y-6 text-theme-text">
      <div className="flex items-center gap-2 pb-4 border-b border-theme/60">
        <BellRing className="w-5 h-5 text-primary-blue" />
        <h3 className="text-base font-bold text-theme-heading font-montserrat">Notification Preferences</h3>
      </div>

      {msg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{msg}</span>
        </div>
      )}

      <div className="space-y-4">
        {toggleItems.map((item) => {
          const isChecked = notifs[item.key];
          return (
            <div
              key={item.key}
              onClick={() => !item.locked && toggleKey(item.key)}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 cursor-pointer ${
                item.locked ? 'bg-theme-surface/50 border-theme/40 opacity-80 cursor-not-allowed' : 'bg-theme-surface border-theme/60 hover:border-blue-500/40'
              }`}
            >
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-theme-heading">{item.label}</h4>
                <p className="text-[11px] text-theme-muted">{item.description}</p>
              </div>

              {/* Toggle Switch */}
              <div
                className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                  isChecked ? 'bg-blue-600' : 'bg-slate-600'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 left-0.5 shadow-sm ${
                    isChecked ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="px-6 py-2.5 rounded-xl text-xs font-bold text-white brand-gradient-bg shadow-md"
      >
        {isSaving ? 'Saving Preferences...' : 'Save Preferences'}
      </button>
    </div>
  );
}
