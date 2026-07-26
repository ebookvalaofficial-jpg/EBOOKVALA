import React from 'react';
import { prisma } from '@/lib/prisma';
import AuthorApplicationReviewCard from '@/components/admin/AuthorApplicationReviewCard';
import AdminBreadcrumbs from '@/components/admin/AdminBreadcrumbs';
import { UserCheck } from 'lucide-react';

export default async function AdminAuthorApplicationsPage() {
  const applications = await prisma.authorApplication.findMany({
    where: { status: 'PENDING' },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6 font-inter text-theme-text">
      <AdminBreadcrumbs
        title="Author Applications Review"
        description="Review and verify user applications to join the EbookVala Author Guild"
      />

      {applications.length === 0 ? (
        <div className="p-12 text-center space-y-3 rounded-3xl bg-theme-card border border-theme glass-card shadow-xl">
          <UserCheck className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-theme-heading font-montserrat">No Pending Author Applications</h3>
          <p className="text-xs text-theme-muted">All submitted author applications have been reviewed.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {applications.map((app) => (
            <AuthorApplicationReviewCard
              key={app.id}
              application={{
                ...app,
                createdAt: app.createdAt.toISOString(),
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
