'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { User, Shield, Crown, UserX, RefreshCw } from 'lucide-react';

interface MemberItem {
  id: string;
  role: string; // OWNER, MODERATOR, MEMBER
  joinedAt: string;
  user: {
    id: string;
    name?: string | null;
    image?: string | null;
    isAuthor?: boolean;
  };
}

interface ClubMembersListProps {
  clubId: string;
  members: MemberItem[];
  currentUserRole?: string | null; // OWNER, MODERATOR, MEMBER
  onMembersUpdated?: () => void;
}

export default function ClubMembersList({
  clubId,
  members,
  currentUserRole,
  onMembersUpdated,
}: ClubMembersListProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const isOwnerOrMod = currentUserRole && ['OWNER', 'MODERATOR'].includes(currentUserRole);

  const handleManageMember = async (targetUserId: string, newRole?: string) => {
    setLoadingId(targetUserId);

    try {
      const url = newRole
        ? `/api/community/clubs/${clubId}?targetUserId=${targetUserId}&newRole=${newRole}`
        : `/api/community/clubs/${clubId}?targetUserId=${targetUserId}`;

      const res = await fetch(url, { method: 'DELETE' });
      if (res.ok && onMembersUpdated) {
        onMembersUpdated();
      }
    } catch (err) {
      console.error('Error managing club member:', err);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-3 font-inter text-theme-text">
      {members.map((m) => (
        <div
          key={m.id}
          className="p-3.5 rounded-2xl bg-theme-surface/50 border border-theme/40 flex items-center justify-between gap-3 text-xs"
        >
          <div className="flex items-center gap-3">
            <Link href={`/profile/${m.user.id}`}>
              <div className="relative w-8 h-8 rounded-xl overflow-hidden bg-theme-surface border border-theme/60 shrink-0">
                {m.user.image ? (
                  <Image src={m.user.image} alt={m.user.name || 'User'} fill className="object-cover" unoptimized />
                ) : (
                  <User className="w-4 h-4 text-theme-muted m-auto" />
                )}
              </div>
            </Link>

            <div>
              <Link href={`/profile/${m.user.id}`} className="font-bold text-theme-heading hover:underline flex items-center gap-1.5">
                <span>{m.user.name || 'Reader'}</span>
                {m.user.isAuthor && (
                  <span className="px-2 py-0.2 rounded-full bg-amber-500/10 text-amber-500 text-[9px] font-black uppercase">
                    Author
                  </span>
                )}
              </Link>
              <span className="text-[10px] text-theme-muted">Joined {new Date(m.joinedAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Role Badge */}
            {m.role === 'OWNER' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase">
                <Crown className="w-3 h-3 fill-amber-500" /> Owner
              </span>
            )}
            {m.role === 'MODERATOR' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-black uppercase">
                <Shield className="w-3 h-3" /> Moderator
              </span>
            )}

            {/* Management Controls */}
            {isOwnerOrMod && m.role !== 'OWNER' && (
              <div className="flex items-center gap-1.5 ml-2">
                {m.role === 'MEMBER' && (
                  <button
                    onClick={() => handleManageMember(m.user.id, 'MODERATOR')}
                    disabled={loadingId === m.user.id}
                    className="px-2.5 py-1 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-600 hover:text-white text-[10px] font-bold transition-colors"
                  >
                    Promote Mod
                  </button>
                )}

                <button
                  onClick={() => handleManageMember(m.user.id)}
                  disabled={loadingId === m.user.id}
                  className="p-1 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white text-[10px] transition-colors"
                  title="Remove from club"
                >
                  {loadingId === m.user.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <UserX className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
