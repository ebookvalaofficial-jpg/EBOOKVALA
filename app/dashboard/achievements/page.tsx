import React from 'react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AchievementBadge, { AchievementItem } from '@/components/dashboard/AchievementBadge';
import { Trophy, Sparkles, Award } from 'lucide-react';

export default async function AchievementsPage() {
  const session = await auth();

  const user = await prisma.user.findUnique({
    where: { email: session!.user!.email! },
  });

  if (!user) return null;

  const allAchievements = await prisma.achievement.findMany({
    orderBy: { createdAt: 'asc' },
  });

  const userAchievements = await prisma.userAchievement.findMany({
    where: { userId: user.id },
  });

  const unlockedMap = new Map(
    userAchievements.map((ua) => [ua.achievementId, ua.unlockedAt])
  );

  const formattedAchievements: AchievementItem[] = allAchievements.map((ach) => {
    const unlockedAt = unlockedMap.get(ach.id);
    return {
      id: ach.id,
      key: ach.key,
      title: ach.title,
      description: ach.description,
      iconName: ach.iconName,
      criteriaDescription: ach.criteriaDescription,
      isUnlocked: Boolean(unlockedAt),
      unlockedAt: unlockedAt ? unlockedAt.toISOString() : null,
    };
  });

  const unlockedCount = formattedAchievements.filter((a) => a.isUnlocked).length;
  const progressPercent = Math.round((unlockedCount / Math.max(1, allAchievements.length)) * 100);

  return (
    <div className="space-y-8 text-theme-text">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-theme-card border border-theme glass-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20">
            <Trophy className="w-3.5 h-3.5 fill-amber-500" /> Reader Achievements
          </span>
          <h1 className="text-2xl font-black text-theme-heading font-montserrat">
            Badges & Reading Milestones
          </h1>
          <p className="text-xs text-theme-muted">
            Unlock exclusive badges by completing eBooks, maintaining daily streaks, and writing insights.
          </p>
        </div>

        {/* Progress % Widget */}
        <div className="p-4 rounded-2xl bg-theme-surface border border-theme/60 space-y-2 min-w-[200px]">
          <div className="flex items-center justify-between text-xs font-bold font-stats">
            <span>Progress</span>
            <span className="text-primary-blue">{unlockedCount} / {allAchievements.length} Unlocked</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-500/20 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {formattedAchievements.map((item) => (
          <AchievementBadge key={item.id} achievement={item} />
        ))}
      </div>
    </div>
  );
}
