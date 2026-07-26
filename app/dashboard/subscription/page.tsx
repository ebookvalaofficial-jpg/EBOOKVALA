'use client';

import React, { useState, useEffect } from 'react';
import SubscriptionCard, { SubscriptionData } from '@/components/account/SubscriptionCard';
import { Sparkles } from 'lucide-react';

export default function DashboardSubscriptionPage() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadSubscription = async () => {
    setIsLoading(true);
    try {
      setSubscription({
        plan: 'PRO',
        status: 'ACTIVE',
        currentPeriodEnd: new Date(Date.now() + 86400000 * 30).toISOString(),
      });
    } catch (err) {
      console.error('Error fetching subscription:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSubscription();
  }, []);

  if (isLoading) {
    return (
      <div className="py-16 text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-theme-text max-w-4xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-primary-blue flex items-center justify-center border border-blue-500/20">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-theme-heading font-montserrat">Manage Pro Subscription</h1>
          <p className="text-xs text-theme-muted">
            View your active reading plan, manage renewal preferences, or upgrade for unlimited access.
          </p>
        </div>
      </div>

      <SubscriptionCard subscription={subscription} onRefresh={loadSubscription} />
    </div>
  );
}
