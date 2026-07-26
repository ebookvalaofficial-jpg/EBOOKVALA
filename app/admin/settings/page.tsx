'use client';

import React, { useState, useEffect } from 'react';
import AdminBreadcrumbs from '@/components/admin/AdminBreadcrumbs';
import { Save, ShieldAlert, Check, Globe, Mail, Share2 } from 'lucide-react';

export default function AdminSettingsPage() {
  const [siteName, setSiteName] = useState('EbookVala');
  const [supportEmail, setSupportEmail] = useState('support@ebookvala.com');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [twitterUrl, setTwitterUrl] = useState('https://twitter.com/ebookvala');
  const [facebookUrl, setFacebookUrl] = useState('https://facebook.com/ebookvala');
  const [instagramUrl, setInstagramUrl] = useState('https://instagram.com/ebookvala');
  const [linkedinUrl, setLinkedinUrl] = useState('https://linkedin.com/company/ebookvala');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/admin/settings');
        if (res.ok) {
          const json = await res.json();
          if (json) {
            setSiteName(json.siteName || 'EbookVala');
            setSupportEmail(json.supportEmail || 'support@ebookvala.com');
            setMaintenanceMode(Boolean(json.maintenanceMode));
            setTwitterUrl(json.twitterUrl || '');
            setFacebookUrl(json.facebookUrl || '');
            setInstagramUrl(json.instagramUrl || '');
            setLinkedinUrl(json.linkedinUrl || '');
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteName,
          supportEmail,
          maintenanceMode,
          twitterUrl,
          facebookUrl,
          instagramUrl,
          linkedinUrl,
        }),
      });

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <div className="w-48 h-6 bg-slate-800 rounded animate-pulse" />
        <div className="w-full h-96 bg-slate-900 rounded-3xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <AdminBreadcrumbs
        title="Global Site Settings"
        description="Configure system parameters, support contact, maintenance mode, and social media links."
        action={
          savedSuccess ? (
            <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
              <Check className="w-4 h-4" /> Settings Saved!
            </span>
          ) : undefined
        }
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* Maintenance Mode Banner / Card */}
        <div className={`p-6 rounded-3xl border transition-all ${maintenanceMode ? 'bg-red-500/10 border-red-500/40' : 'bg-theme-card border-theme'}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${maintenanceMode ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/10 text-primary-blue'}`}>
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-theme-heading font-montserrat">
                  Maintenance Mode
                </h3>
                <p className="text-xs text-theme-muted mt-0.5 max-w-lg">
                  When enabled, non-admin visitors will see a &quot;Site under maintenance&quot; banner page. Administrators remain fully logged in.
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>
        </div>

        {/* General Site Information */}
        <div className="p-6 rounded-3xl bg-theme-card border border-theme space-y-4">
          <h3 className="text-sm font-bold text-theme-heading font-montserrat uppercase tracking-wider text-primary-blue flex items-center gap-2">
            <Globe className="w-4 h-4" /> Platform Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-theme-heading mb-1">
                Site Name
              </label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-theme text-xs text-theme-heading focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-theme-heading mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-blue-500" /> Support Contact Email
              </label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-theme text-xs text-theme-heading focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                required
              />
            </div>
          </div>
        </div>

        {/* Footer Social Links */}
        <div className="p-6 rounded-3xl bg-theme-card border border-theme space-y-4">
          <h3 className="text-sm font-bold text-theme-heading font-montserrat uppercase tracking-wider text-primary-blue flex items-center gap-2">
            <Share2 className="w-4 h-4" /> Social Media Links (Footer)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-theme-heading mb-1">Twitter / X URL</label>
              <input
                type="url"
                value={twitterUrl}
                onChange={(e) => setTwitterUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-theme text-xs text-theme-heading focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-theme-heading mb-1">Facebook URL</label>
              <input
                type="url"
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-theme text-xs text-theme-heading focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-theme-heading mb-1">Instagram URL</label>
              <input
                type="url"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-theme text-xs text-theme-heading focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-theme-heading mb-1">LinkedIn URL</label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-theme text-xs text-theme-heading focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 rounded-xl text-sm font-bold text-white brand-gradient-bg shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 flex items-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
