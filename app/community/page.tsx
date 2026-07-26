import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import ActivityFeed from '@/components/community/ActivityFeed';
import DiscussionCard from '@/components/community/DiscussionCard';
import ReadingClubCard from '@/components/community/ReadingClubCard';
import { MessageSquare, Users, Plus, Sparkles, ArrowRight } from 'lucide-react';

export default async function CommunityHomePage() {
  // Fetch trending discussions
  const discussions = await prisma.discussion.findMany({
    where: { authorUser: { isBanned: false } },
    include: {
      authorUser: { select: { id: true, name: true, image: true, isAuthor: true } },
      book: { select: { id: true, title: true, slug: true, coverImageUrl: true } },
      category: { select: { id: true, name: true, slug: true } },
      _count: { select: { replies: true } },
    },
    orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    take: 4,
  });

  // Fetch featured reading clubs
  const clubs = await prisma.readingClub.findMany({
    include: {
      createdByUser: { select: { id: true, name: true, image: true } },
      currentBook: { select: { id: true, title: true, slug: true, coverImageUrl: true } },
      _count: { select: { members: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 3,
  });

  return (
    <main className="min-h-screen bg-theme-bg py-8 px-4 sm:px-6 font-inter text-theme-text">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Hero Banner */}
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-500/20 glass-card flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-black uppercase font-montserrat">
              <Sparkles className="w-3.5 h-3.5 fill-amber-500" />
              <span>Reader Hub & Social Forum</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-theme-heading font-montserrat tracking-tight leading-tight">
              Connect with Readers & Authors
            </h1>

            <p className="text-xs sm:text-sm text-theme-muted font-semibold leading-relaxed">
              Share book reviews, participate in category discussions, follow your favorite authors, and join collaborative reading clubs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/community/discussions/new"
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-extrabold text-xs uppercase tracking-wide shadow-xl flex items-center gap-2 hover:scale-105 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Discussion</span>
            </Link>

            <Link
              href="/community/clubs/new"
              className="px-6 py-3 rounded-2xl bg-theme-surface border border-theme/60 text-theme-heading text-xs font-bold uppercase hover:bg-slate-500/10 transition-all flex items-center gap-2"
            >
              <Users className="w-4 h-4 text-blue-500" />
              <span>Start Reading Club</span>
            </Link>
          </div>
        </div>

        {/* Main Grid: Activity Feed + Discussions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Activity Feed Stream */}
          <div className="lg:col-span-2 space-y-6">
            <ActivityFeed />
          </div>

          {/* Right Col: Trending Discussions */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-theme/60 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-theme-heading font-montserrat">Trending Discussions</h3>
              </div>

              <Link href="/community/discussions" className="text-xs font-bold text-amber-500 hover:underline flex items-center gap-1">
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-4">
              {discussions.map((d) => (
                <DiscussionCard key={d.id} discussion={{ ...d, createdAt: d.createdAt.toISOString() }} />
              ))}
            </div>
          </div>
        </div>

        {/* Reading Clubs Section */}
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between border-b border-theme/60 pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              <h3 className="text-base font-bold text-theme-heading font-montserrat">Popular Reading Clubs</h3>
            </div>

            <Link href="/community/clubs" className="text-xs font-bold text-amber-500 hover:underline flex items-center gap-1">
              <span>Browse Clubs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {clubs.map((c) => (
              <ReadingClubCard key={c.id} club={c} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
