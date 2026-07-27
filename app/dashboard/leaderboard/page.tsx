'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Trophy, Medal, Award, Flame, Coins, Share2, Copy, Check, ShieldCheck, Loader2 } from 'lucide-react';

interface LeaderboardUser {
  userId: string;
  name: string;
  image?: string | null;
  totalXp: number;
  level: number;
  rank: number;
  isCurrentUser: boolean;
}

export default function LeaderboardPage() {
  const [filter, setFilter] = useState<'all-time' | 'monthly' | 'weekly'>('all-time');
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [userStats, setUserStats] = useState<{
    totalXp: number;
    totalCoins: number;
    level: number;
    rank: number | string;
    referralCode: string;
    showOnLeaderboard: boolean;
  } | null>(null);

  const [copied, setCopied] = useState(false);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/dashboard/gamification?filter=${filter}`);
      if (res.ok) {
        const json = await res.json();
        setLeaderboard(json.leaderboard || []);
        setUserStats(json.currentUserStats || null);
      }
    } catch (err) {
      console.error('Leaderboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [filter]);

  const handleCopyReferral = () => {
    if (!userStats?.referralCode) return;
    const link = `${window.location.origin}/signup?ref=${userStats.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-amber-400 fill-amber-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-slate-300 fill-slate-300" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-700 fill-amber-700" />;
    return <span className="text-sm font-extrabold text-theme-muted font-stats">#{rank}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-theme-card border border-theme glass-card">
        <h1 className="text-2xl font-extrabold text-theme-heading font-montserrat flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-400" /> Reader Leaderboard & Gamification
        </h1>
        <p className="text-xs text-theme-muted mt-1">
          Compete with fellow eBook enthusiasts, climb the global ranks, and invite friends to earn XP and Coins.
        </p>
      </div>

      {/* Referral Program Card */}
      {userStats && (
        <div className="p-6 rounded-3xl brand-gradient-bg text-white shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-blue-200">
            <Share2 className="w-4 h-4" /> Invite Friends & Earn Rewards
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold font-montserrat">Share your unique referral link</h2>
              <p className="text-xs text-blue-100 mt-1 max-w-lg">
                Earn <strong className="text-white">+50 XP and +5 Coins</strong> for every reader who signs up using your code!
              </p>
            </div>

            <div className="flex items-center gap-2 bg-slate-950/60 p-2.5 rounded-2xl border border-white/20 shrink-0">
              <span className="text-xs font-mono font-extrabold px-3 py-1 bg-blue-600 rounded-xl uppercase">
                {userStats.referralCode}
              </span>
              <button
                onClick={handleCopyReferral}
                className="px-3 py-1.5 rounded-xl bg-white text-blue-700 text-xs font-bold hover:bg-blue-50 transition-all flex items-center gap-1.5"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Link Copied!' : 'Copy Share Link'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4 border-b border-theme/60 pb-3">
        <div className="flex items-center gap-2">
          {[
            { key: 'all-time', label: 'All-Time Ranks' },
            { key: 'monthly', label: 'This Month' },
            { key: 'weekly', label: 'This Week' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                filter === tab.key
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'bg-theme-card text-theme-muted hover:text-theme-heading border border-theme'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {userStats && (
          <div className="text-xs font-bold text-theme-muted">
            Your Rank: <strong className="text-amber-400 font-stats">#{userStats.rank}</strong> ({userStats.totalXp} XP)
          </div>
        )}
      </div>

      {/* Leaderboard Table */}
      {loading ? (
        <div className="py-16 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-theme-card border border-theme glass-card">
          <Trophy className="w-10 h-10 text-theme-muted mx-auto opacity-40" />
          <h3 className="text-sm font-bold text-theme-heading mt-2">No leaderboard activity found</h3>
        </div>
      ) : (
        <div className="rounded-3xl bg-theme-card border border-theme glass-card overflow-hidden shadow-lg">
          <div className="divide-y divide-theme/40">
            {leaderboard.map((user) => (
              <div
                key={user.userId}
                className={`p-4 flex items-center justify-between gap-4 transition-colors ${
                  user.isCurrentUser ? 'bg-blue-500/10 border-l-4 border-primary-blue' : 'hover:bg-theme-surface/40'
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-8 text-center shrink-0">
                    {getRankBadge(user.rank)}
                  </div>

                  <div className="w-10 h-10 rounded-2xl overflow-hidden bg-slate-800 text-white font-extrabold flex items-center justify-center text-xs shrink-0 border border-theme relative">
                    {user.image ? (
                      <Image src={user.image} alt={user.name} fill className="object-cover" />
                    ) : (
                      user.name[0].toUpperCase()
                    )}
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-sm font-extrabold text-theme-heading font-montserrat truncate flex items-center gap-2">
                      <span>{user.name}</span>
                      {user.isCurrentUser && (
                        <span className="text-[9px] font-black uppercase tracking-wider bg-blue-500 text-white px-2 py-0.5 rounded-full">
                          YOU
                        </span>
                      )}
                    </h3>
                    <span className="text-[11px] text-theme-muted font-semibold">Level {user.level} Reader</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-base font-black text-amber-400 font-stats flex items-center gap-1 justify-end">
                    <Trophy className="w-4 h-4 text-amber-400" /> {user.totalXp} XP
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
