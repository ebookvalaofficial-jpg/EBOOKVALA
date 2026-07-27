'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Flame, Trophy, Coins, Sparkles, CheckCircle2, Clock, BookOpen, Target, Loader2, Gift } from 'lucide-react';

interface StatsData {
  streak: { current: number; longest: number };
  todayMinutes: number;
  totalHours: string;
  weeklyData: { day: string; minutes: number }[];
  gamification: {
    totalXp: number;
    totalCoins: number;
    level: number;
    claimedToday: boolean;
  };
  goal: {
    dailyMinutes: number;
    dailyPages: number;
    weeklyBooks: number;
    monthlyBooks: number;
    yearlyBooks: number;
  };
}

export default function ReaderDashboardClient() {
  const [data, setData] = useState<StatsData | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/dashboard/stats');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Stats fetch error:', err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleClaimDailyReward = async () => {
    try {
      setClaiming(true);
      const res = await fetch('/api/dashboard/daily-reward', { method: 'POST' });
      const json = await res.json();
      if (res.ok) {
        setClaimSuccess(json.message);
        setTimeout(() => setClaimSuccess(null), 4000);
        await fetchStats();
      } else {
        alert(json.error || 'Failed to claim reward');
      }
    } catch (err) {
      console.error('Claim error:', err);
    } finally {
      setClaiming(false);
    }
  };

  if (!data) return null;

  const { gamification, streak, todayMinutes, goal } = data;
  const minutesGoal = goal.dailyMinutes || 30;
  const minutesProgress = Math.min(100, Math.round((todayMinutes / minutesGoal) * 100));

  return (
    <div className="space-y-6">
      {/* Top Banner: XP, Level & Daily Streak Reward Claim */}
      <div className="p-6 rounded-3xl bg-theme-card border border-theme glass-card shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl brand-gradient-bg text-white flex flex-col items-center justify-center font-black shadow-lg shadow-blue-500/20 shrink-0">
            <span className="text-[10px] text-blue-200 font-bold uppercase tracking-wider">LEVEL</span>
            <span className="text-xl leading-none font-stats">{gamification.level}</span>
          </div>

          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm font-extrabold text-theme-heading font-montserrat flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400" /> {gamification.totalXp} XP Points
              </span>
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-400/20 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5" /> {gamification.totalCoins} Coins
              </span>
              <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-400/20 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-rose-400" /> {streak.current} Day Streak
              </span>
            </div>
            <p className="text-xs text-theme-muted mt-1 font-medium">
              Earn XP for reading, completing chapters, and claiming daily login rewards.
            </p>
          </div>
        </div>

        {/* Daily Bonus Claim Widget */}
        <div className="w-full md:w-auto shrink-0">
          {claimSuccess ? (
            <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> {claimSuccess}
            </div>
          ) : (
            <button
              onClick={handleClaimDailyReward}
              disabled={gamification.claimedToday || claiming}
              className={`w-full md:w-auto px-5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md ${
                gamification.claimedToday
                  ? 'bg-slate-100 dark:bg-slate-800 text-theme-muted cursor-not-allowed border border-theme'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-amber-500/20'
              }`}
            >
              {claiming ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Gift className="w-4 h-4 text-white" />
              )}
              <span>{gamification.claimedToday ? 'Daily Bonus Claimed Today ✔' : 'Claim Daily Reward (+10 XP & +1 Coin)'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress Tracker Widget against Reading Goal */}
      <div className="p-6 rounded-3xl bg-theme-card border border-theme glass-card shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary-blue" />
            <h3 className="text-sm font-bold text-theme-heading font-montserrat">Today&apos;s Reading Goal</h3>
          </div>
          <Link href="/dashboard/goals" className="text-xs font-bold text-primary-blue hover:underline">
            Configure Goals →
          </Link>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-theme-muted">
              {todayMinutes} of {minutesGoal} mins read today
            </span>
            <span className="text-primary-blue font-stats">{minutesProgress}%</span>
          </div>
          <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${minutesProgress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
