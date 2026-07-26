import React from 'react';
import { prisma } from '@/lib/prisma';
import BookSubmissionReviewCard from '@/components/admin/BookSubmissionReviewCard';
import AdminBreadcrumbs from '@/components/admin/AdminBreadcrumbs';
import { BookOpen } from 'lucide-react';

export default async function AdminBookSubmissionsPage() {
  const submissions = await prisma.authorBookSubmission.findMany({
    where: { status: { in: ['SUBMITTED', 'IN_REVIEW'] } },
    include: {
      category: { select: { name: true } },
      authorUser: { select: { name: true, email: true } },
    },
    orderBy: { submittedAt: 'desc' },
  });

  return (
    <div className="space-y-6 font-inter text-theme-text">
      <AdminBreadcrumbs
        title="eBook Submissions Review"
        description="Review author manuscript submissions and approve for live publishing to the storefront"
      />

      {submissions.length === 0 ? (
        <div className="p-12 text-center space-y-3 rounded-3xl bg-theme-card border border-theme glass-card shadow-xl">
          <BookOpen className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-theme-heading font-montserrat">No Pending Book Submissions</h3>
          <p className="text-xs text-theme-muted">All author manuscript submissions have been reviewed.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {submissions.map((sub) => (
            <BookSubmissionReviewCard
              key={sub.id}
              submission={{
                ...sub,
                submittedAt: sub.submittedAt ? sub.submittedAt.toISOString() : null,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
