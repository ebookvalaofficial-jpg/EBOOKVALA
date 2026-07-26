'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, UserCheck, RefreshCw } from 'lucide-react';

interface JoinClubButtonProps {
  clubId: string;
  initialIsMember: boolean;
  memberCount: number;
  memberLimit?: number | null;
}

export default function JoinClubButton({
  clubId,
  initialIsMember,
  memberCount,
  memberLimit,
}: JoinClubButtonProps) {
  const router = useRouter();
  const [isMember, setIsMember] = useState(initialIsMember);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFull = memberLimit ? memberCount >= memberLimit : false;

  const handleToggle = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/community/clubs/${clubId}`, {
        method: 'POST',
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to update club membership');
        return;
      }

      setIsMember(data.isMember);
      router.refresh();
    } catch (err: any) {
      setError('Network error updating membership');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-1 text-right font-inter">
      {error && (
        <div className="text-[11px] font-bold text-red-500">{error}</div>
      )}

      <button
        onClick={handleToggle}
        disabled={isLoading || (!isMember && isFull)}
        className={`px-6 py-3 rounded-2xl text-xs font-extrabold shadow-xl uppercase tracking-wide transition-all flex items-center gap-2 ${
          isMember
            ? 'bg-theme-surface border border-theme/60 text-theme-heading hover:bg-red-500/10 hover:text-red-500'
            : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white disabled:opacity-40'
        }`}
      >
        {isLoading ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : isMember ? (
          <>
            <UserCheck className="w-4 h-4 text-emerald-500" />
            <span>Leave Reading Club</span>
          </>
        ) : (
          <>
            <UserPlus className="w-4 h-4" />
            <span>{isFull ? 'Club Full' : 'Join Reading Club'}</span>
          </>
        )}
      </button>
    </div>
  );
}
