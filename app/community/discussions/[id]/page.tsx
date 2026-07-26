import React from 'react';
import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import DiscussionThread from '@/components/community/DiscussionThread';

interface DiscussionDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function DiscussionDetailPage({ params }: DiscussionDetailPageProps) {
  const { id } = await params;
  const session = await auth();

  const discussion = await prisma.discussion.findUnique({
    where: { id },
    include: {
      authorUser: { select: { id: true, name: true, image: true, isAuthor: true, isBanned: true } },
      book: { select: { id: true, title: true, slug: true, coverImageUrl: true } },
      category: { select: { id: true, name: true, slug: true } },
    },
  });

  if (!discussion || discussion.authorUser.isBanned) {
    notFound();
  }

  // Deduplicated view count increment
  await prisma.discussion.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  });

  let currentUser: { id: string; role: string } | null = null;
  if (session?.user?.email) {
    currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });
  }

  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN';

  return (
    <main className="min-h-screen bg-theme-bg py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <DiscussionThread
          discussion={{
            ...discussion,
            createdAt: discussion.createdAt.toISOString(),
          }}
          currentUserId={currentUser?.id}
          isAdmin={isAdmin}
        />
      </div>
    </main>
  );
}
