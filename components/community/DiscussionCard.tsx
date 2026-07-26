'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Pin, Lock, MessageSquare, Eye, User, BookOpen } from 'lucide-react';

interface DiscussionCardProps {
  discussion: {
    id: string;
    title: string;
    body: string;
    isPinned: boolean;
    isLocked: boolean;
    viewCount: number;
    createdAt: string;
    authorUser: {
      id: string;
      name?: string | null;
      image?: string | null;
      isAuthor?: boolean;
    };
    book?: {
      id: string;
      title: string;
      slug: string;
      coverImageUrl?: string;
    } | null;
    category?: {
      id: string;
      name: string;
      slug: string;
    } | null;
    _count?: {
      replies: number;
    };
  };
}

export default function DiscussionCard({ discussion }: DiscussionCardProps) {
  return (
    <div className="p-6 rounded-3xl bg-theme-card border border-theme glass-card space-y-4 shadow-xl hover:border-amber-500/40 transition-all duration-300 font-inter text-theme-text group">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link href={`/profile/${discussion.authorUser.id}`} className="shrink-0">
            <div className="relative w-9 h-9 rounded-2xl overflow-hidden bg-theme-surface border border-theme/60">
              {discussion.authorUser.image ? (
                <Image
                  src={discussion.authorUser.image}
                  alt={discussion.authorUser.name || 'User'}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <User className="w-5 h-5 text-theme-muted m-auto" />
              )}
            </div>
          </Link>

          <div className="min-w-0 text-xs">
            <div className="flex items-center gap-1.5 truncate">
              <Link
                href={`/profile/${discussion.authorUser.id}`}
                className="font-bold text-theme-heading hover:underline truncate"
              >
                {discussion.authorUser.name || 'Anonymous Reader'}
              </Link>

              {discussion.authorUser.isAuthor && (
                <span className="px-2 py-0.2 rounded-full bg-amber-500/10 text-amber-500 text-[9px] font-black uppercase shrink-0">
                  Author
                </span>
              )}
            </div>

            <span className="text-[10px] text-theme-muted">
              {new Date(discussion.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* Pinned / Locked Badges */}
        <div className="flex items-center gap-1.5 shrink-0">
          {discussion.isPinned && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase">
              <Pin className="w-3 h-3 fill-amber-500" /> Pinned
            </span>
          )}

          {discussion.isLocked && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase">
              <Lock className="w-3 h-3" /> Locked
            </span>
          )}
        </div>
      </div>

      {/* Title & Excerpt */}
      <div className="space-y-1">
        <Link href={`/community/discussions/${discussion.id}`}>
          <h3 className="text-base font-bold text-theme-heading font-montserrat group-hover:text-amber-500 transition-colors line-clamp-2">
            {discussion.title}
          </h3>
        </Link>

        <p className="text-xs text-theme-muted line-clamp-2 leading-relaxed">
          {discussion.body.replace(/<[^>]*>?/gm, '')}
        </p>
      </div>

      {/* Footer: Tags & Stats */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-theme/40 text-xs">
        <div className="flex items-center gap-2">
          {discussion.book && (
            <Link
              href={`/books/${discussion.book.slug}`}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-500 text-[10px] font-bold truncate max-w-[180px]"
            >
              <BookOpen className="w-3 h-3 shrink-0" />
              <span className="truncate">{discussion.book.title}</span>
            </Link>
          )}

          {discussion.category && (
            <span className="px-2.5 py-1 rounded-xl bg-blue-500/10 text-blue-500 text-[10px] font-bold">
              {discussion.category.name}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 text-theme-muted text-[11px] font-semibold">
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
            {discussion._count?.replies || 0} replies
          </span>

          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            {discussion.viewCount || 0} views
          </span>
        </div>
      </div>
    </div>
  );
}
