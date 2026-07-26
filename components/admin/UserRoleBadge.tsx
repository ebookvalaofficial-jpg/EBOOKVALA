import React from 'react';
import { Shield, ShieldAlert, UserCheck, Ban } from 'lucide-react';

interface UserRoleBadgeProps {
  role?: string;
  isBanned?: boolean;
}

export default function UserRoleBadge({ role = 'USER', isBanned = false }: UserRoleBadgeProps) {
  if (isBanned) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/20 shadow-sm">
        <Ban className="w-3 h-3" />
        Banned
      </span>
    );
  }

  if (role === 'SUPER_ADMIN') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/30 shadow-sm">
        <ShieldAlert className="w-3 h-3 text-purple-400" />
        Super Admin
      </span>
    );
  }

  if (role === 'ADMIN') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/30 shadow-sm">
        <Shield className="w-3 h-3 text-blue-400" />
        Admin
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-slate-500/10 text-theme-muted border border-theme/40">
      <UserCheck className="w-3 h-3" />
      User
    </span>
  );
}
