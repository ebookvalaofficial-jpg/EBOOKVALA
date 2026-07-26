'use client';

import React from 'react';

export interface StreakDay {
  date: string;
  count: number; // 0 to 4 intensity level
}

interface StreakCalendarProps {
  days: StreakDay[];
  currentStreak: number;
  longestStreak: number;
}

const colorLevels: Record<number, string> = {
  0: 'bg-slate-500/10 border-slate-500/10',
  1: 'bg-blue-900/40 border-blue-800/40',
  2: 'bg-blue-700/60 border-blue-600/60',
  3: 'bg-blue-500 border-blue-400',
  4: 'bg-indigo-500 border-indigo-400 shadow-xs shadow-blue-500/50',
};

export default function StreakCalendar({ days, currentStreak, longestStreak }: StreakCalendarProps) {
  return (
    <div className="p-6 rounded-3xl bg-theme-card border border-theme glass-card space-y-4 text-theme-text">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-theme-heading font-montserrat">Reading Streak Heatmap</h3>
          <p className="text-xs text-theme-muted">Daily reading activity over the past 90 days</p>
        </div>

        <div className="flex items-center gap-4 text-xs font-bold font-stats">
          <span className="text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            🔥 {currentStreak} Current Days
          </span>
          <span className="text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
            🏆 {longestStreak} Best Streak
          </span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto pb-2">
        <div className="grid grid-rows-7 grid-flow-col gap-1.5 min-w-[600px]">
          {days.map((d, i) => (
            <div
              key={i}
              title={`${d.date}: ${d.count > 0 ? `${d.count * 20} mins read` : 'No activity'}`}
              className={`w-3.5 h-3.5 rounded-sm border transition-all ${colorLevels[Math.min(4, d.count)]}`}
            />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1.5 text-[10px] text-theme-muted font-bold">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <span key={level} className={`w-3 h-3 rounded-xs border ${colorLevels[level]}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
