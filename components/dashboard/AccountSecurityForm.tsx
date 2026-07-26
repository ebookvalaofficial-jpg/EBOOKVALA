'use client';

import React, { useState } from 'react';
import { Shield, KeyRound, Lock, AlertTriangle, Check, Trash2, X } from 'lucide-react';
import { signOut } from 'next-auth/react';

interface AccountSecurityFormProps {
  provider: string;
  connectedAccounts: string[];
  hasPassword: boolean;
}

export default function AccountSecurityForm({
  provider,
  connectedAccounts,
  hasPassword,
}: AccountSecurityFormProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passMsg, setPassMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const isOAuthOnly = provider === 'google' && !hasPassword;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPassMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setIsChangingPass(true);
    setPassMsg(null);

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'change-password',
          currentPassword,
          newPassword,
        }),
      });

      if (res.ok) {
        setPassMsg({ type: 'success', text: 'Password changed successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const data = await res.json();
        setPassMsg({ type: 'error', text: data.error || 'Failed to change password' });
      }
    } catch (err: any) {
      setPassMsg({ type: 'error', text: 'Network error occurred' });
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    setIsDeletingAccount(true);

    try {
      const res = await fetch('/api/profile', {
        method: 'DELETE',
      });

      if (res.ok) {
        signOut({ callbackUrl: '/' });
      }
    } catch (err) {
      console.error('Error deleting account:', err);
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className="space-y-6 text-theme-text">
      {/* 1. Password Change Card */}
      <div className="p-6 rounded-3xl bg-theme-card border border-theme glass-card space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-theme/60">
          <KeyRound className="w-5 h-5 text-primary-blue" />
          <h3 className="text-base font-bold text-theme-heading font-montserrat">Security & Password</h3>
        </div>

        {isOAuthOnly ? (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-semibold space-y-1">
            <p className="font-bold">Google Single Sign-On Connected</p>
            <p className="opacity-90">
              Your account is secured via Google OAuth. Password change is disabled for single sign-on logins.
            </p>
          </div>
        ) : (
          <form onSubmit={handleChangePassword} className="space-y-4">
            {passMsg && (
              <div
                className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                  passMsg.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                    : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                }`}
              >
                {passMsg.type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                <span>{passMsg.text}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-theme-heading block">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-theme-surface border border-theme text-xs font-semibold text-theme-heading focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-theme-heading block">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-theme-surface border border-theme text-xs font-semibold text-theme-heading focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-theme-heading block">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-theme-surface border border-theme text-xs font-semibold text-theme-heading focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isChangingPass}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white brand-gradient-bg shadow-md"
            >
              {isChangingPass ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        )}
      </div>

      {/* 2. Connected Accounts Card */}
      <div className="p-6 rounded-3xl bg-theme-card border border-theme glass-card space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-theme/60">
          <Shield className="w-5 h-5 text-emerald-500" />
          <h3 className="text-base font-bold text-theme-heading font-montserrat">Connected Authentication Accounts</h3>
        </div>

        <div className="space-y-2">
          <div className="p-3.5 rounded-2xl bg-theme-surface border border-theme/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
                G
              </div>
              <div>
                <h4 className="text-xs font-bold text-theme-heading">Google Account</h4>
                <p className="text-[10px] text-theme-muted">
                  {connectedAccounts.includes('google') ? 'Connected for 1-click sign in' : 'Not connected'}
                </p>
              </div>
            </div>
            {connectedAccounts.includes('google') ? (
              <span className="text-[10px] font-extrabold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                Connected
              </span>
            ) : (
              <span className="text-[10px] font-extrabold text-theme-muted bg-slate-500/10 px-2.5 py-1 rounded-full">
                Disconnected
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Danger Zone Account Deletion Card */}
      <div className="p-6 rounded-3xl bg-rose-500/5 border border-rose-500/30 glass-card space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-rose-500/20 text-rose-500">
          <AlertTriangle className="w-5 h-5" />
          <h3 className="text-base font-bold font-montserrat">Danger Zone</h3>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold text-theme-heading">Delete Account Permanently</h4>
            <p className="text-[11px] text-theme-muted">
              Permanently delete your user profile, saved reading progress, bookmarks, notes, and preferences.
            </p>
          </div>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md transition-colors shrink-0"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Account Deletion Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in" data-lenis-prevent>
          <div className="w-full max-w-md p-6 rounded-3xl bg-theme-card border border-rose-500/40 shadow-2xl space-y-4 text-theme-text">
            <div className="flex items-center justify-between pb-3 border-b border-theme/60">
              <div className="flex items-center gap-2 text-rose-500 font-bold">
                <Trash2 className="w-5 h-5" />
                <span className="text-base font-montserrat">Confirm Account Deletion</span>
              </div>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="p-1 rounded-lg text-theme-muted hover:text-theme-heading"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-theme-muted leading-relaxed">
              This action <strong className="text-rose-500">CANNOT be undone</strong>. All your purchases, reading history, bookmarks, notes, and achievements will be permanently removed.
            </p>

            <div className="space-y-1">
              <label className="text-xs font-bold text-theme-heading block">
                Type <strong className="text-rose-500">DELETE</strong> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full px-3.5 py-2 rounded-xl bg-theme-surface border border-rose-500/40 text-xs font-bold text-theme-heading focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-theme-surface border border-theme text-theme-heading hover:bg-slate-500/10"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || isDeletingAccount}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white disabled:opacity-50 shadow-md"
              >
                {isDeletingAccount ? 'Deleting Account...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
