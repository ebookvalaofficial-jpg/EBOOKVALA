import React from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AuthorSidebar from '@/components/author/AuthorSidebar';

export default async function AuthorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || !session.user?.email) {
    redirect(`/login?callbackUrl=${encodeURIComponent('/author')}`);
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { authorProfile: true },
  });

  if (!user || !user.isAuthor) {
    redirect('/become-an-author');
  }

  const penName = user.authorProfile?.name || user.name || 'Author';

  return (
    <div className="min-h-screen bg-theme-bg flex flex-col md:flex-row">
      <AuthorSidebar penName={penName} />
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
