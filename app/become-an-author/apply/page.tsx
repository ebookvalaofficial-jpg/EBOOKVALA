import React from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AuthorApplicationForm from '@/components/author/AuthorApplicationForm';

export default async function ApplyAuthorPage() {
  const session = await auth();

  if (!session || !session.user?.email) {
    redirect(`/login?callbackUrl=${encodeURIComponent('/become-an-author/apply')}`);
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      authorApplications: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  if (!user) {
    redirect('/login');
  }

  if (user.isAuthor) {
    redirect('/author');
  }

  const latestApp = user.authorApplications[0] || null;

  return (
    <main className="min-h-screen bg-theme-bg py-12 px-4 sm:px-6">
      <AuthorApplicationForm
        initialStatus={user.authorApplicationStatus}
        rejectionNote={latestApp?.reviewNote}
      />
    </main>
  );
}
