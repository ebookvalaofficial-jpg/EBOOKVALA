import React from 'react';
import {
  Library,
  CheckCircle,
  Flame,
  Clock,
  BookOpen,
  Award,
  BarChart3,
  Sparkles,
  ShoppingBag,
  LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Library,
  CheckCircle,
  Flame,
  Clock,
  BookOpen,
  Award,
  BarChart3,
  Sparkles,
  ShoppingBag,
};

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon?: LucideIcon;
  iconName?: string;
  colorClass?: string;
  bgClass?: string;
  isLoading?: boolean;
}

export default function StatCard({
  title,
  value,
  subtext,
  icon: IconProp,
  iconName,
  colorClass = 'text-primary-blue',
  bgClass = 'bg-blue-500/10 border-blue-500/20',
  isLoading = false,
}: StatCardProps) {
  const Icon = IconProp || (iconName ? iconMap[iconName] : null) || Library;

  if (isLoading) {
    return (
      <div className="p-5 rounded-3xl bg-theme-card border border-theme glass-card space-y-3 animate-pulse shadow-sm">
        <div className="flex items-center justify-between">
          <div className="w-24 h-3 rounded-md bg-slate-500/20" />
          <div className="w-10 h-10 rounded-2xl bg-slate-500/20" />
        </div>
        <div className="space-y-2 pt-1">
          <div className="w-32 h-7 rounded-lg bg-slate-500/20" />
          <div className="w-20 h-3 rounded-md bg-slate-500/20" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-3xl bg-theme-card border border-theme glass-card hover:border-blue-500/40 transition-all hover:scale-[1.01] shadow-sm space-y-3 group text-theme-text">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-theme-muted font-montserrat">
          {title}
        </span>
        <div className={`p-2.5 rounded-2xl border ${bgClass} ${colorClass} group-hover:scale-110 transition-transform`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="text-2xl sm:text-3xl font-black text-theme-heading font-stats tracking-tight">{value}</h3>
        {subtext && <p className="text-[11px] font-semibold text-theme-muted">{subtext}</p>}
      </div>
    </div>
  );
}
