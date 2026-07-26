import React from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import BookSubmissionForm from '@/components/author/BookSubmissionForm';

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBookSubmissionPage({ params }: EditPageProps) {
  const session = await auth();
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { email: session?.user?.email! },
  });

  const submission = await prisma.authorBookSubmission.findUnique({
    where: { id },
  });

  if (!submission || submission.authorUserId !== user?.id) {
    redirect('/author/books');
  }

  if (['APPROVED', 'PUBLISHED'].includes(submission.status)) {
    redirect('/author/books');
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  });

  const formattedChapters = JSON.parse(submission.manuscriptChapters || '[]');

  return (
    <div className="space-y-6 font-inter text-theme-text">
      <div>
        <h1 className="text-2xl font-bold text-theme-heading font-montserrat">Edit Manuscript Submission</h1>
        <p className="text-xs text-theme-muted">Update draft details or address reviewer feedback.</p>
      </div>

      <BookSubmissionForm
        categories={categories}
        initialData={{
          id: submission.id,
          title: submission.title,
          description: submission.description,
          categoryId: submission.categoryId,
          coverImageUrl: submission.coverImageUrl,
          price: submission.price,
          manuscriptChapters: formattedChapters,
          status: submission.status,
          rejectionReason: submission.rejectionReason,
        }}
      />
    </div>
  );
}
