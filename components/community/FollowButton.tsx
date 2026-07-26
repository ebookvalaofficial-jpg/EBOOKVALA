'use client';

import React, { useState } from 'react';
import { UserPlus, UserCheck, RefreshCw } from 'lucide-react';

interface FollowButtonProps {
  targetUserId: string;
  initialIsFollowing?: boolean;
  initialFollowersCount?: number;
  onFollowToggle?: (newIsFollowing: boolean, newCount: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

export default function FollowButton({
  targetUserId,
  initialIsFollowing = false,
  initialFollowersCount = 0,
  onFollowToggle,
  size = 'md',
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followersCount, setFollowersCount] = useState(initialFollowersCount);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);
    // Optimistic UI update
    const nextFollowing = !isFollowing;
    const nextCount = nextFollowing ? followersCount + 1 : Math.max(0, followersCount - 1);
    setIsFollowing(nextFollowing);
    setFollowersCount(nextCount);

    try {
      const res = await fetch('/api/community/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId }),
      });

      const data = await res.json();
      if (!res.ok) {
        // Rollback on failure
        setIsFollowing(isFollowing);
        setFollowersCount(followersCount);
        return;
      }

      setIsFollowing(data.isFollowing);
      setFollowersCount(data.followersCount);

      if (onFollowToggle) {
        onFollowToggle(data.isFollowing, data.followersCount);
      }
    } catch (err) {
      // Rollback on network error
      setIsFollowing(isFollowing);
      setFollowersCount(followersCount);
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'px-3 py-1 text-xs gap-1 rounded-xl',
    md: 'px-4 py-2 text-xs font-bold gap-1.5 rounded-2xl',
    lg: 'px-6 py-2.5 text-sm font-extrabold gap-2 rounded-2xl',
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`inline-flex items-center justify-center transition-all shadow-md font-montserrat uppercase tracking-wide ${
        sizeClasses[size]
      } ${
        isFollowing
          ? 'bg-theme-surface border border-theme/60 text-theme-heading hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30'
          : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white'
      }`}
    >
      {isLoading ? (
        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
      ) : isFollowing ? (
        <>
          <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Following</span>
        </>
      ) : (
        <>
          <UserPlus className="w-3.5 h-3.5" />
          <span>Follow</span>
        </>
      )}
    </button>
  );
}
