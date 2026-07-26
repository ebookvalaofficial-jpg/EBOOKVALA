'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import UserRoleBadge from '@/components/admin/UserRoleBadge';
import ConfirmActionDialog from '@/components/admin/ConfirmActionDialog';
import { ArrowLeft, Shield, Ban, CheckCircle, ShoppingBag, BookOpen, Clock, AlertCircle } from 'lucide-react';

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Action States
  const [selectedRole, setSelectedRole] = useState<string>('USER');
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchUserDetails = async () => {
    try {
      const res = await fetch(`/api/admin/users/${id}`);
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        setSelectedRole(data.user.role || 'USER');
      } else {
        setError(data.error || 'User not found');
      }
    } catch (err) {
      setError('Network error loading user details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const handleRoleChangeConfirm = async () => {
    setIsActionLoading(true);
    setActionError(null);

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update role');
      }

      setIsRoleModalOpen(false);
      fetchUserDetails();
    } catch (err: any) {
      setActionError(err.message || 'Error updating role');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleBanToggleConfirm = async () => {
    setIsActionLoading(true);
    setActionError(null);

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBanned: !user.isBanned }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to toggle ban status');
      }

      setIsBanModalOpen(false);
      fetchUserDetails();
    } catch (err: any) {
      setActionError(err.message || 'Error toggling ban status');
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-xs font-bold text-theme-muted bg-theme-card rounded-3xl border border-theme">
        Loading user profile details...
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-8 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold space-y-4 text-center">
        <p>{error || 'User not found'}</p>
        <Link href="/admin/users" className="inline-block px-4 py-2 bg-theme-surface rounded-xl text-theme-heading border border-theme">
          Return to Users
        </Link>
      </div>
    );
  }

  const paidOrders = user.orders?.filter((o: any) => o.status === 'PAID') || [];
  const totalSpentPaise = paidOrders.reduce((sum: number, o: any) => sum + o.amount, 0);

  return (
    <div className="space-y-6 text-theme-text">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/users"
          className="p-2.5 rounded-2xl border border-theme/60 hover:bg-slate-500/10 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-theme-heading font-montserrat">User Profile: {user.name || 'User'}</h1>
          <p className="text-xs text-theme-muted">ID: {user.id} • Registered {new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      {actionError && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Main Profile Summary Card */}
      <div className="p-6 rounded-3xl bg-theme-card border border-theme glass-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/20 text-blue-500 font-black text-xl flex items-center justify-center border border-blue-500/30 shrink-0">
            {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-theme-heading">{user.name || 'User'}</h2>
              <UserRoleBadge role={user.role} isBanned={user.isBanned} />
            </div>
            <p className="text-xs text-theme-muted mt-0.5">{user.email}</p>
            <p className="text-[11px] text-theme-muted mt-1">Provider: <span className="font-bold text-theme-heading capitalize">{user.provider || 'credentials'}</span></p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Role Change Trigger (SUPER_ADMIN ONLY REQUIREMENT) */}
          <button
            onClick={() => setIsRoleModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-purple-600/10 border border-purple-500/20 text-purple-400 hover:bg-purple-600 hover:text-white text-xs font-bold transition-all flex items-center gap-2"
          >
            <Shield className="w-4 h-4" />
            <span>Change Role</span>
          </button>

          {/* Ban / Unban Toggle */}
          <button
            onClick={() => setIsBanModalOpen(true)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
              user.isBanned
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-600 hover:text-white'
                : 'bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-600 hover:text-white'
            }`}
          >
            {user.isBanned ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
            <span>{user.isBanned ? 'Unban Account' : 'Ban Account'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-theme-card border border-theme glass-card space-y-1">
          <span className="text-xs font-bold text-theme-muted uppercase tracking-wider">Total Spent</span>
          <p className="text-2xl font-black text-theme-heading font-stats">₹{Math.round(totalSpentPaise / 100)}</p>
        </div>

        <div className="p-5 rounded-3xl bg-theme-card border border-theme glass-card space-y-1">
          <span className="text-xs font-bold text-theme-muted uppercase tracking-wider">Purchased Books</span>
          <p className="text-2xl font-black text-theme-heading font-stats">{user.purchases?.length || 0} eBooks</p>
        </div>

        <div className="p-5 rounded-3xl bg-theme-card border border-theme glass-card space-y-1">
          <span className="text-xs font-bold text-theme-muted uppercase tracking-wider">Total Orders</span>
          <p className="text-2xl font-black text-theme-heading font-stats">{user.orders?.length || 0} Orders</p>
        </div>
      </div>

      {/* Purchase History */}
      <div className="p-6 rounded-3xl bg-theme-card border border-theme glass-card space-y-4">
        <h3 className="text-base font-bold text-theme-heading font-montserrat pb-2 border-b border-theme/60">
          Purchased Library Books ({user.purchases?.length || 0})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {user.purchases?.length === 0 ? (
            <p className="text-xs text-theme-muted col-span-full">No book purchases on record.</p>
          ) : (
            user.purchases?.map((p: any) => (
              <div key={p.id} className="p-3 rounded-2xl bg-theme-surface/50 border border-theme/40 flex items-center gap-3">
                <div className="w-8 h-12 bg-blue-600/20 rounded shrink-0 overflow-hidden relative">
                  {p.book?.coverImageUrl && (
                    <img src={p.book.coverImageUrl} alt={p.book.title} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-theme-heading truncate">{p.book?.title || 'Book'}</p>
                  <p className="text-[10px] text-theme-muted">{new Date(p.purchasedAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Role Change Modal */}
      <ConfirmActionDialog
        isOpen={isRoleModalOpen}
        title="Change Account Role"
        description={
          <div className="space-y-3">
            <p>Select a new security role for <strong className="text-white">{user.email}</strong>. Only Super Admins can execute role changes.</p>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-theme-card border border-theme text-xs font-bold text-theme-heading focus:outline-none"
            >
              <option value="USER">USER (Standard Member)</option>
              <option value="ADMIN">ADMIN (Operations Admin)</option>
              <option value="SUPER_ADMIN">SUPER_ADMIN (Full System Administrator)</option>
            </select>
          </div>
        }
        confirmText="Confirm Role Change"
        confirmButtonClass="bg-purple-600 hover:bg-purple-500 text-white"
        isLoading={isActionLoading}
        onConfirm={handleRoleChangeConfirm}
        onClose={() => setIsRoleModalOpen(false)}
      />

      {/* Ban / Unban Modal */}
      <ConfirmActionDialog
        isOpen={isBanModalOpen}
        title={user.isBanned ? 'Unban User Account' : 'Ban User Account'}
        description={
          <span>
            {user.isBanned ? (
              <>Are you sure you want to restore access for <strong className="text-white">{user.email}</strong>?</>
            ) : (
              <>Are you sure you want to ban <strong className="text-white">{user.email}</strong>? Banned users are blocked at middleware & authentication levels.</>
            )}
          </span>
        }
        confirmText={user.isBanned ? 'Confirm Unban' : 'Confirm Ban'}
        confirmButtonClass={user.isBanned ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-red-600 hover:bg-red-500 text-white'}
        isLoading={isActionLoading}
        onConfirm={handleBanToggleConfirm}
        onClose={() => setIsBanModalOpen(false)}
      />
    </div>
  );
}
