'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Users, BookOpen, Lock, Globe } from 'lucide-react';

interface ReadingClubCardProps {
  club: {
    id: string;
    name: string;
    description: string;
    coverImageUrl?: string | null;
    isPublic: boolean;
    memberLimit?: number | null;
    createdByUser: {
      name?: string | null;
    };
    currentBook?: {
      id: string;
      title: string;
      slug: string;
      coverImageUrl?: string;
    } | null;
    _count?: {
      members: number;
    };
  };
}

export default function ReadingClubCard({ club }: ReadingClubCardProps) {
  const memberCount = club._count?.members || 0;

  return (
    <div className="p-6 rounded-3xl bg-theme-card border border-theme glass-card space-y-5 shadow-xl hover:border-amber-500/40 transition-all duration-300 font-inter text-theme-text flex flex-col justify-between group">
      <div className="space-y-4">
        {/* Cover & Header */}
        <div className="flex gap-4">
          <div className="relative w-20 h-24 rounded-2xl overflow-hidden bg-theme-surface border border-theme/60 shrink-0">
            {club.coverImageUrl ? (
              <Image src={club.coverImageUrl} alt={club.name} fill className="object-cover" unoptimized />
            ) : (
              <Users className="w-8 h-8 text-amber-500 m-auto" />
            )}
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-1.5">
              {club.isPublic ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase">
                  <Globe className="w-3 h-3" /> Public Club
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase">
                  <Lock className="w-3 h-3" /> Private Club
                </span>
              )}
            </div>

            <Link href={`/community/clubs/${club.id}`}>
              <h3 className="text-base font-bold text-theme-heading font-montserrat group-hover:text-amber-500 transition-colors truncate">
                {club.name}
              </h3>
            </Link>

            <p className="text-xs text-theme-muted line-clamp-2">{club.description}</p>
          </div>
        </div>

        {/* Current Book Badge */}
        {club.currentBook && (
          <div className="p-3 rounded-2xl bg-theme-surface/50 border border-theme/40 flex items-center gap-3 text-xs">
            <div className="relative w-8 h-10 rounded-lg overflow-hidden bg-theme-surface shrink-0">
              {club.currentBook.coverImageUrl ? (
                <Image src={club.currentBook.coverImageUrl} alt={club.currentBook.title} fill className="object-cover" unoptimized />
              ) : (
                <BookOpen className="w-4 h-4 text-theme-muted m-auto" />
              )}
            </div>

            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase text-amber-500 block">Currently Reading</span>
              <strong className="font-bold text-theme-heading truncate block">{club.currentBook.title}</strong>
            </div>
          </div>
        )}
      </div>

      {/* Footer Stats & CTA */}
      <div className="flex items-center justify-between pt-3 border-t border-theme/40 text-xs">
        <span className="flex items-center gap-1 text-theme-muted font-bold">
          <Users className="w-4 h-4 text-blue-500" />
          {memberCount} {club.memberLimit ? `/ ${club.memberLimit}` : ''} members
        </span>

        <Link
          href={`/community/clubs/${club.id}`}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-extrabold shadow-md uppercase text-[11px] tracking-wide"
        >
          View Club
        </Link>
      </div>
    </div>
  );
}
