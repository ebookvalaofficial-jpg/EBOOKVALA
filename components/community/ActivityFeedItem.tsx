'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BookCheck, Star, Users, MessageSquare, Award, User } from 'lucide-react';

interface ActivityFeedItemProps {
  item: {
    id: string;
    type: string; // FINISHED_BOOK, WROTE_REVIEW, JOINED_CLUB, STARTED_DISCUSSION, UNLOCKED_ACHIEVEMENT
    targetType?: string | null;
    targetId?: string | null;
    metadata?: any;
    createdAt: string;
    user: {
      id: string;
      name?: string | null;
      image?: string | null;
      isAuthor?: boolean;
    };
  };
}

export default function ActivityFeedItem({ item }: ActivityFeedItemProps) {
  const renderActivityText = () => {
    switch (item.type) {
      case 'FINISHED_BOOK':
        return (
          <>
            finished reading{' '}
            <Link
              href={item.targetId ? `/books/${item.targetId}` : '/books'}
              className="font-extrabold text-amber-500 hover:underline"
            >
              {item.metadata?.bookTitle || 'eBook'}
            </Link>
          </>
        );
      case 'WROTE_REVIEW':
        return (
          <>
            wrote a review for{' '}
            <Link
              href={item.targetId ? `/books/${item.targetId}` : '/books'}
              className="font-extrabold text-amber-500 hover:underline"
            >
              {item.metadata?.bookTitle || 'eBook'}
            </Link>{' '}
            ({item.metadata?.rating} ★)
          </>
        );
      case 'JOINED_CLUB':
        return (
          <>
            joined reading club{' '}
            <Link
              href={item.targetId ? `/community/clubs/${item.targetId}` : '/community/clubs'}
              className="font-extrabold text-amber-500 hover:underline"
            >
              {item.metadata?.clubName || 'Reading Club'}
            </Link>
          </>
        );
      case 'STARTED_DISCUSSION':
        return (
          <>
            started a discussion{' '}
            <Link
              href={item.targetId ? `/community/discussions/${item.targetId}` : '/community/discussions'}
              className="font-extrabold text-amber-500 hover:underline"
            >
              &quot;{item.metadata?.title || 'Discussion'}&quot;
            </Link>
          </>
        );
      case 'UNLOCKED_ACHIEVEMENT':
        return (
          <>
            unlocked achievement{' '}
            <span className="font-extrabold text-amber-500">
              🏆 {item.metadata?.title || 'Achievement'}
            </span>
          </>
        );
      default:
        return <span>performed an activity</span>;
    }
  };

  const renderIcon = () => {
    switch (item.type) {
      case 'FINISHED_BOOK':
        return <BookCheck className="w-4 h-4 text-emerald-500" />;
      case 'WROTE_REVIEW':
        return <Star className="w-4 h-4 text-amber-400 fill-amber-400" />;
      case 'JOINED_CLUB':
        return <Users className="w-4 h-4 text-blue-500" />;
      case 'STARTED_DISCUSSION':
        return <MessageSquare className="w-4 h-4 text-purple-500" />;
      case 'UNLOCKED_ACHIEVEMENT':
        return <Award className="w-4 h-4 text-amber-500" />;
      default:
        return <User className="w-4 h-4 text-theme-muted" />;
    }
  };

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-theme-card border border-theme glass-card space-y-3 shadow-lg font-inter text-theme-text hover:border-amber-500/30 transition-all">
      <div className="flex items-center gap-3">
        <Link href={`/profile/${item.user.id}`}>
          <div className="relative w-9 h-9 rounded-2xl overflow-hidden bg-theme-surface border border-theme/60 shrink-0">
            {item.user.image ? (
              <Image src={item.user.image} alt={item.user.name || 'User'} fill className="object-cover" unoptimized />
            ) : (
              <User className="w-5 h-5 text-theme-muted m-auto" />
            )}
          </div>
        </Link>

        <div className="flex-1 min-w-0 text-xs font-semibold">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link href={`/profile/${item.user.id}`} className="font-bold text-theme-heading hover:underline">
              {item.user.name || 'Reader'}
            </Link>

            {item.user.isAuthor && (
              <span className="px-2 py-0.2 rounded-full bg-amber-500/10 text-amber-500 text-[9px] font-black uppercase">
                Author
              </span>
            )}

            <span className="text-theme-muted">{renderActivityText()}</span>
          </div>

          <span className="text-[10px] text-theme-muted mt-0.5 block">
            {new Date(item.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>

        <div className="p-2 rounded-xl bg-theme-surface/60 border border-theme/40 shrink-0">
          {renderIcon()}
        </div>
      </div>

      {item.metadata?.comment && (
        <p className="text-xs text-theme-muted italic bg-theme-surface/40 p-3 rounded-2xl border border-theme/40">
          &quot;{item.metadata.comment}&quot;
        </p>
      )}
    </div>
  );
}
