import React from 'react';
import { prisma } from '@/lib/prisma';
import BookSubmissionForm from '@/components/author/BookSubmissionForm';

export default async function NewBookSubmissionPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  });

  return (
    <div className="space-y-6 font-inter text-theme-text">
      <div>
        <h1 className="text-2xl font-bold text-theme-heading font-montserrat">New Book Submission</h1>
        <p className="text-xs text-theme-muted">Create a new manuscript submission for publication on EbookVala.</p>
      </div>

      <BookSubmissionForm categories={categories} />
    </div>
  );
}
