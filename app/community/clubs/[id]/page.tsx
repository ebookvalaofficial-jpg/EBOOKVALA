import React from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ClubMembersList from '@/components/community/ClubMembersList';
import DiscussionCard from '@/components/community/DiscussionCard';
import { Users, BookOpen, Lock, Globe, Plus } from 'lucide-react';
import JoinClubButton from './JoinClubButton';

interface ClubDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ReadingClubDetailPage({ params }: ClubDetailPageProps) {
  const { id } = await params;
  const session = await auth();

  const club = await prisma.readingClub.findUnique({
    where: { id },
    include: {
      createdByUser: { select: { id: true, name: true, image: true } },
      currentBook: { select: { id: true, title: true, slug: true, coverImageUrl: true } },
      members: {
        include: {
          user: { select: { id: true, name: true, image: true, isAuthor: true } },
        },
        orderBy: { joinedAt: 'asc' },
      },
      _count: { select: { members: true } },
    },
  });

  if (!club) notFound();

  let me: { id: string } | null = null;
  if (session?.user?.email) {
    me = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
  }

  const myMembership = me
    ? club.members.find((m) => m.userId === me.id)
    : null;

  const isMember = !!myMembership;
  const userRole = myMembership?.role || null;

  // Fetch discussions linked to the club's current book
  const clubDiscussions = club.currentBookId
    ? await prisma.discussion.findMany({
        where: { bookId: club.currentBookId, authorUser: { isBanned: false } },
        include: {
          authorUser: { select: { id: true, name: true, image: true, isAuthor: true } },
          book: { select: { id: true, title: true, slug: true, coverImageUrl: true } },
          _count: { select: { replies: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      })
    : [];

  return (
    <main className="min-h-screen bg-theme-bg py-8 px-4 sm:px-6 font-inter text-theme-text">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Hero */}
        <div className="p-6 sm:p-8 rounded-3xl bg-theme-card border border-theme glass-card space-y-6 shadow-xl">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex gap-5">
              <div className="relative w-24 h-28 rounded-3xl overflow-hidden bg-theme-surface border border-theme/60 shrink-0 shadow-md">
                {club.coverImageUrl ? (
                  <Image src={club.coverImageUrl} alt={club.name} fill className="object-cover" unoptimized />
                ) : (
                  <Users className="w-10 h-10 text-amber-500 m-auto" />
                )}
              </div>

              <div className="space-y-2 min-w-0">
                <div className="flex items-center gap-2">
                  {club.isPublic ? (
                    <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase">
                      <Globe className="w-3 h-3" /> Public Reading Club
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase">
                      <Lock className="w-3 h-3" /> Private Reading Club
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-theme-heading font-montserrat">{club.name}</h1>
                <p className="text-xs text-theme-muted max-w-xl leading-relaxed">{club.description}</p>
                <div className="text-xs text-theme-muted font-bold">
                  Created by <span className="text-theme-heading">{club.createdByUser.name}</span>
                </div>
              </div>
            </div>

            <JoinClubButton
              clubId={club.id}
              initialIsMember={isMember}
              memberCount={club._count.members}
              memberLimit={club.memberLimit}
            />
          </div>

          {/* Current Book Feature */}
          {club.currentBook && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-16 rounded-xl overflow-hidden bg-theme-surface border border-theme/60 shrink-0">
                  {club.currentBook.coverImageUrl ? (
                    <Image src={club.currentBook.coverImageUrl} alt={club.currentBook.title} fill className="object-cover" unoptimized />
                  ) : (
                    <BookOpen className="w-6 h-6 text-theme-muted m-auto" />
                  )}
                </div>

                <div>
                  <span className="text-[10px] font-black uppercase text-amber-500 block">Club Selection of the Month</span>
                  <strong className="font-bold text-theme-heading text-sm">{club.currentBook.title}</strong>
                </div>
              </div>

              <Link
                href={`/books/${club.currentBook.slug}`}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-white text-xs font-bold shadow-md transition-colors"
              >
                Read & Discuss Book
              </Link>
            </div>
          )}
        </div>

        {/* Content Layout: Members Sidebar + Discussions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Club Members */}
          <div className="p-6 rounded-3xl bg-theme-card border border-theme glass-card space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-theme/60 pb-3">
              <h3 className="text-base font-bold text-theme-heading font-montserrat flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                <span>Club Members ({club.members.length})</span>
              </h3>
            </div>

            <ClubMembersList
              clubId={club.id}
              members={club.members.map((m) => ({ ...m, joinedAt: m.joinedAt.toISOString() }))}
              currentUserRole={userRole}
            />
          </div>

          {/* Right Column: Linked Club Discussions */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between border-b border-theme/60 pb-3">
              <h3 className="text-base font-bold text-theme-heading font-montserrat flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-500" />
                <span>Club Book Discussions</span>
              </h3>

              {club.currentBookId && (
                <Link
                  href={`/community/discussions/new?bookId=${club.currentBookId}`}
                  className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Start Discussion</span>
                </Link>
              )}
            </div>

            {clubDiscussions.length === 0 ? (
              <div className="p-8 text-center space-y-2 rounded-3xl bg-theme-card border border-theme glass-card">
                <p className="text-xs text-theme-muted">No discussion threads created for this club&apos;s current book yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {clubDiscussions.map((d) => (
                  <DiscussionCard key={d.id} discussion={{ ...d, createdAt: d.createdAt.toISOString() }} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
