'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Trophy, Coins, Plus, Minus, Search, ShieldCheck, Loader2, Check } from 'lucide-react';

interface UserGamification {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  totalXp: number;
  totalCoins: number;
  level: number;
}

export default function AdminGamificationPage() {
  const [users, setUsers] = useState<UserGamification[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [selectedUser, setSelectedUser] = useState<UserGamification | null>(null);
  const [grantType, setGrantType] = useState<'xp' | 'coins'>('xp');
  const [grantAmount, setGrantAmount] = useState('50');
  const [grantReason, setGrantReason] = useState('Community Reward');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchGamificationUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/gamification');
      if (res.ok) {
        const json = await res.json();
        setUsers(json.users || []);
      }
    } catch (err) {
      console.error('Admin gamification fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGamificationUsers();
  }, []);

  const handleGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !grantAmount) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/admin/gamification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          type: grantType,
          amount: Number(grantAmount),
          reason: grantReason,
        }),
      });

      const json = await res.json();
      if (res.ok) {
        setMessage(json.message);
        setTimeout(() => setMessage(null), 3000);
        setSelectedUser(null);
        await fetchGamificationUsers();
      }
    } catch (err) {
      console.error('Grant error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-theme-card border border-theme glass-card">
        <div>
          <h1 className="text-2xl font-extrabold text-theme-heading font-montserrat flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-400" /> Gamification & XP Moderation
          </h1>
          <p className="text-xs text-theme-muted mt-1">
            Monitor user XP balances, coins, and levels. Manually award or adjust XP & Coins for community contributions.
          </p>
        </div>

        {/* Search */}
        <div className="relative shrink-0 w-full sm:w-64">
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-theme-surface border border-theme rounded-2xl text-xs font-semibold text-theme-heading focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <Search className="w-4 h-4 text-theme-muted absolute left-3 top-3" />
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4" /> {message}
        </div>
      )}

      {/* Users Table */}
      {loading ? (
        <div className="py-16 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-theme-card border border-theme glass-card">
          <p className="text-xs text-theme-muted">No users matching search query</p>
        </div>
      ) : (
        <div className="rounded-3xl bg-theme-card border border-theme glass-card overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-theme/60 bg-theme-surface/60 text-theme-muted font-bold uppercase tracking-wider">
                  <th className="p-4">User</th>
                  <th className="p-4">Level</th>
                  <th className="p-4">XP Points</th>
                  <th className="p-4">Coins</th>
                  <th className="p-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme/40">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-theme-surface/40 transition-colors">
                    <td className="p-4 flex items-center gap-3 font-bold text-theme-heading">
                      <div className="w-8 h-8 rounded-xl overflow-hidden bg-slate-800 text-white font-extrabold flex items-center justify-center text-xs shrink-0 border border-theme relative">
                        {u.image ? (
                          <Image src={u.image} alt={u.name} fill className="object-cover" />
                        ) : (
                          u.name[0].toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="block truncate">{u.name}</span>
                        <span className="text-[10px] text-theme-muted font-normal block truncate">{u.email}</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-primary-blue border border-blue-500/20 font-black text-[11px]">
                        Level {u.level}
                      </span>
                    </td>

                    <td className="p-4 font-black text-amber-400 font-stats">
                      {u.totalXp} XP
                    </td>

                    <td className="p-4 font-black text-amber-500 font-stats">
                      {u.totalCoins} Coins
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedUser(u)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold hover:bg-amber-500/20 transition-all inline-flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" /> Adjust Balance
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Grant/Adjust Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md p-6 rounded-3xl bg-theme-card border border-theme glass-card shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-theme-heading font-montserrat flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" /> Adjust Balance: {selectedUser.name}
            </h3>

            <form onSubmit={handleGrant} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-theme-heading uppercase tracking-wider mb-1">
                  Currency Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setGrantType('xp')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      grantType === 'xp'
                        ? 'bg-amber-500/20 border-amber-400 text-amber-400'
                        : 'bg-theme-surface border-theme text-theme-muted'
                    }`}
                  >
                    XP Points
                  </button>

                  <button
                    type="button"
                    onClick={() => setGrantType('coins')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      grantType === 'coins'
                        ? 'bg-amber-500/20 border-amber-400 text-amber-400'
                        : 'bg-theme-surface border-theme text-theme-muted'
                    }`}
                  >
                    Coins
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-theme-heading uppercase tracking-wider mb-1">
                  Amount (Positive to Grant, Negative to Deduct)
                </label>
                <input
                  type="number"
                  value={grantAmount}
                  onChange={(e) => setGrantAmount(e.target.value)}
                  placeholder="e.g. 50 or -20"
                  className="w-full px-4 py-2.5 bg-theme-surface border border-theme rounded-xl text-sm font-bold text-theme-heading focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-theme-heading uppercase tracking-wider mb-1">
                  Reason / Audit Log Note
                </label>
                <input
                  type="text"
                  value={grantReason}
                  onChange={(e) => setGrantReason(e.target.value)}
                  placeholder="e.g. Contest Winner, Bonus"
                  className="w-full px-4 py-2.5 bg-theme-surface border border-theme rounded-xl text-sm text-theme-heading focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-theme-muted hover:text-theme-heading"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition-all shadow-md flex items-center gap-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
