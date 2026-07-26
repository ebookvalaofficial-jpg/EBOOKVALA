import React from 'react';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import UserProfileHeader from '@/components/community/UserProfileHeader';
import ActivityFeedItem from '@/components/community/ActivityFeedItem';
import ReadingClubCard from '@/components/community/ReadingClubCard';
import { Activity, Star, Users, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface ProfilePageProps {
  params: Promise<{ userId: string }>;
}

export default async function PublicProfilePage({ params }: ProfilePageProps) {
  const { userId } = await params;
  const session = await auth();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      activityFeedItems: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      reviews: {
        where: { isHidden: false },
        include: {
          book: { select: { id: true, title: true, slug: true, coverImageUrl: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
      clubMemberships: {
        include: {
          club: {
            include: {
              createdByUser: { select: { id: true, name: true, image: true } },
              currentBook: { select: { id: true, title: true, slug: true, coverImageUrl: true } },
              _count: { select: { members: true } },
            },
          },
        },
        orderBy: { joinedAt: 'desc' },
      },
    },
  });

  if (!user) notFound();

  // Handle banned user state
  if (user.isBanned) {
    return (
      <main className="min-h-screen bg-theme-bg py-12 px-4 sm:px-6 font-inter text-theme-text flex items-center justify-center">
        <div className="max-w-md w-full p-8 rounded-3xl bg-theme-card border border-theme glass-card text-center space-y-4 shadow-xl">
          <div className="p-4 rounded-2xl bg-red-500/10 text-red-500 w-max mx-auto border border-red-500/20">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-theme-heading font-montserrat">Account Unavailable</h2>
          <p className="text-xs text-theme-muted">
            This profile is currently suspended or unavailable due to community guideline violations.
          </p>
        </div>
      </main>
    );
  }

  let me: { id: string } | null = null;
  let isFollowing = false;

  if (session?.user?.email) {
    me = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (me) {
      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: me.id,
            followingId: user.id,
          },
        },
      });
      isFollowing = !!follow;
    }
  }

  const followersCount = await prisma.follow.count({
    where: { followingId: user.id },
  });

  const followingCount = await prisma.follow.count({
    where: { followerId: user.id },
  });

  return (
    <main className="min-h-screen bg-theme-bg py-8 px-4 sm:px-6 font-inter text-theme-text">
      <div className="max-w-5xl mx-auto space-y-8">
        <UserProfileHeader
          profileUser={{
            id: user.id,
            name: user.name,
            image: user.image,
            bio: user.bio,
            role: user.role,
            isAuthor: user.isAuthor,
            isBanned: user.isBanned,
          }}
          currentUserId={me?.id}
          initialFollowersCount={followersCount}
          initialFollowingCount={followingCount}
          initialIsFollowing={isFollowing}
        />

        {/* Profile Content Grids */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Activity Feed & Reviews */}
          <div className="lg:col-span-2 space-y-8">
            {/* Activity Stream */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-theme-heading font-montserrat flex items-center gap-2 border-b border-theme/60 pb-3">
                <Activity className="w-5 h-5 text-amber-500" />
                <span>Recent Reader Activity</span>
              </h3>

              {user.activityFeedItems.length === 0 ? (
                <p className="text-xs text-theme-muted p-4 text-center">No recent public activities recorded.</p>
              ) : (
                <div className="space-y-3">
                  {user.activityFeedItems.map((item) => (
                    <ActivityFeedItem
                      key={item.id}
                      item={{
                        ...item,
                        metadata: item.metadata ? JSON.parse(item.metadata) : null,
                        createdAt: item.createdAt.toISOString(),
                        user: { id: user.id, name: user.name, image: user.image, isAuthor: user.isAuthor },
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Book Reviews */}
            <div className="space-y-4 pt-2">
              <h3 className="text-base font-bold text-theme-heading font-montserrat flex items-center gap-2 border-b border-theme/60 pb-3">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span>Book Reviews ({user.reviews.length})</span>
              </h3>

              {user.reviews.length === 0 ? (
                <p className="text-xs text-theme-muted p-4 text-center">No book reviews posted yet.</p>
              ) : (
                <div className="space-y-3">
                  {user.reviews.map((rev) => (
                    <div key={rev.id} className="p-4 rounded-2xl bg-theme-card border border-theme glass-card space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <Link href={`/books/${rev.book.slug}`} className="font-bold text-theme-heading hover:underline text-sm">
                          {rev.book.title}
                        </Link>
                        <span className="font-bold text-amber-400">★ {rev.rating} / 5</span>
                      </div>
                      <p className="text-theme-muted font-semibold leading-relaxed">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Col: Reading Clubs */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-theme-heading font-montserrat flex items-center gap-2 border-b border-theme/60 pb-3">
              <Users className="w-5 h-5 text-blue-500" />
              <span>Joined Reading Clubs ({user.clubMemberships.length})</span>
            </h3>

            {user.clubMemberships.length === 0 ? (
              <p className="text-xs text-theme-muted p-4 text-center">Not a member of any reading clubs yet.</p>
            ) : (
              <div className="space-y-4">
                {user.clubMemberships.map((m) => (
                  <ReadingClubCard key={m.club.id} club={m.club} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
