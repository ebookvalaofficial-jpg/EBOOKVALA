'use client';

import React from 'react';
import Image from 'next/image';
import { User, Feather, ShieldCheck } from 'lucide-react';
import FollowButton from './FollowButton';

interface UserProfileHeaderProps {
  profileUser: {
    id: string;
    name?: string | null;
    image?: string | null;
    bio?: string | null;
    role: string;
    isAuthor: boolean;
    isBanned?: boolean;
  };
  currentUserId?: string | null;
  initialFollowersCount?: number;
  initialFollowingCount?: number;
  initialIsFollowing?: boolean;
}

export default function UserProfileHeader({
  profileUser,
  currentUserId,
  initialFollowersCount = 0,
  initialFollowingCount = 0,
  initialIsFollowing = false,
}: UserProfileHeaderProps) {
  const isOwnProfile = currentUserId === profileUser.id;

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-theme-card border border-theme glass-card space-y-6 shadow-xl font-inter text-theme-text">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="flex gap-4">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden bg-theme-surface border border-theme/60 shrink-0 shadow-md">
            {profileUser.image ? (
              <Image src={profileUser.image} alt={profileUser.name || 'User'} fill className="object-cover" unoptimized />
            ) : (
              <User className="w-10 h-10 text-theme-muted m-auto" />
            )}
          </div>

          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-theme-heading font-montserrat truncate">
                {profileUser.name || 'Anonymous Reader'}
              </h1>

              {profileUser.isAuthor && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-wider">
                  <Feather className="w-3 h-3" /> Verified Author
                </span>
              )}

              {(profileUser.role === 'ADMIN' || profileUser.role === 'SUPER_ADMIN') && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-wider">
                  <ShieldCheck className="w-3 h-3" /> Admin Staff
                </span>
              )}
            </div>

            {profileUser.bio && (
              <p className="text-xs text-theme-muted line-clamp-2 max-w-lg leading-relaxed">{profileUser.bio}</p>
            )}

            {/* Followers / Following Counts */}
            <div className="flex items-center gap-4 text-xs font-bold pt-1">
              <span>
                <strong className="text-theme-heading font-black font-stats text-sm">{initialFollowersCount}</strong>{' '}
                <span className="text-theme-muted font-normal">Followers</span>
              </span>

              <span>
                <strong className="text-theme-heading font-black font-stats text-sm">{initialFollowingCount}</strong>{' '}
                <span className="text-theme-muted font-normal">Following</span>
              </span>
            </div>
          </div>
        </div>

        {/* Follow Button (hidden on own profile) */}
        {!isOwnProfile && (
          <FollowButton
            targetUserId={profileUser.id}
            initialIsFollowing={initialIsFollowing}
            initialFollowersCount={initialFollowersCount}
            size="md"
          />
        )}
      </div>
    </div>
  );
}
