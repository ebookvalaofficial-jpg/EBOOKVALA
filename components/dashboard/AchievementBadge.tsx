'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  ShoppingBag,
  CheckCircle,
  Flame,
  Zap,
  Award,
  Library,
  Clock,
  Highlighter,
  Star,
  Lock,
} from 'lucide-react';

export interface AchievementItem {
  id: string;
  key: string;
  title: string;
  description: string;
  iconName: string;
  criteriaDescription: string;
  isUnlocked: boolean;
  unlockedAt?: string | null;
  isNewlyUnlocked?: boolean;
}

interface AchievementBadgeProps {
  achievement: AchievementItem;
}

const iconMap: Record<string, any> = {
  ShoppingBag,
  CheckCircle,
  Flame,
  Zap,
  Award,
  Library,
  Clock,
  Highlighter,
  Star,
};

export default function AchievementBadge({ achievement }: AchievementBadgeProps) {
  const Icon = iconMap[achievement.iconName] || Award;

  useEffect(() => {
    if (achievement.isNewlyUnlocked) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  }, [achievement.isNewlyUnlocked]);

  return (
    <div
      className={`p-5 rounded-3xl border transition-all relative overflow-hidden flex flex-col justify-between space-y-4 group ${
        achievement.isUnlocked
          ? 'bg-theme-card border-blue-500/40 shadow-lg shadow-blue-500/10 hover:scale-[1.02]'
          : 'bg-theme-surface/50 border-theme/40 opacity-70 grayscale hover:grayscale-0 hover:opacity-100'
      }`}
    >
      {/* Background Subtle Glow */}
      {achievement.isUnlocked && (
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
      )}

      <div className="flex items-start justify-between">
        <div
          className={`p-3 rounded-2xl border transition-transform ${
            achievement.isUnlocked
              ? 'bg-blue-600/10 border-blue-500/30 text-primary-blue group-hover:scale-110 shadow-sm'
              : 'bg-slate-500/10 border-slate-500/20 text-theme-muted'
          }`}
        >
          <Icon className="w-6 h-6" />
        </div>

        {achievement.isUnlocked ? (
          <span className="text-[10px] font-extrabold uppercase bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 px-2.5 py-1 rounded-full">
            Unlocked {achievement.unlockedAt ? new Date(achievement.unlockedAt).toLocaleDateString() : ''}
          </span>
        ) : (
          <span className="text-[10px] font-extrabold uppercase bg-slate-500/10 border border-slate-500/20 text-theme-muted px-2.5 py-1 rounded-full flex items-center gap-1">
            <Lock className="w-3 h-3" /> Locked
          </span>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="text-sm font-bold text-theme-heading font-montserrat">{achievement.title}</h3>
        <p className="text-xs text-theme-muted">{achievement.description}</p>
      </div>

      <div className="pt-2 border-t border-theme/40 text-[10px] font-semibold text-theme-muted italic">
        Criteria: {achievement.criteriaDescription}
      </div>
    </div>
  );
}
