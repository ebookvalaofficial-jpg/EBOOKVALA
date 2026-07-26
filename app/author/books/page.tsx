import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Plus, BookOpen, Edit, Eye } from 'lucide-react';
import SubmissionStatusBadge from '@/components/author/SubmissionStatusBadge';

export default async function AuthorBooksPage() {
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: { email: session?.user?.email! },
  });

  const submissions = await prisma.authorBookSubmission.findMany({
    where: { authorUserId: user?.id! },
    include: { category: true },
    orderBy: { updatedAt: 'desc' },
  });

  return (
    <div className="space-y-6 font-inter text-theme-text">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-theme-heading font-montserrat">My Book Submissions</h1>
          <p className="text-xs text-theme-muted">Manage your manuscripts, draft submissions, and published titles.</p>
        </div>

        <Link
          href="/author/books/new"
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white text-xs font-extrabold shadow-lg transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Submission</span>
        </Link>
      </div>

      {submissions.length === 0 ? (
        <div className="p-12 text-center space-y-4 rounded-3xl bg-theme-card border border-theme glass-card shadow-xl">
          <BookOpen className="w-12 h-12 text-amber-500 mx-auto" />
          <h3 className="text-lg font-bold text-theme-heading">No Manuscripts Yet</h3>
          <p className="text-xs text-theme-muted max-w-md mx-auto">
            You haven&apos;t created any book submissions. Click &quot;New Submission&quot; to write your first eBook!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {submissions.map((sub) => {
            const isEditable = ['DRAFT', 'REJECTED'].includes(sub.status);

            return (
              <div
                key={sub.id}
                className="p-6 rounded-3xl bg-theme-card border border-theme glass-card space-y-4 shadow-xl flex flex-col justify-between"
              >
                <div className="flex gap-4">
                  <div className="relative w-20 h-28 rounded-2xl overflow-hidden bg-theme-surface border border-theme/60 shrink-0">
                    {sub.coverImageUrl ? (
                      <Image src={sub.coverImageUrl} alt={sub.title} fill className="object-cover" unoptimized />
                    ) : (
                      <BookOpen className="w-8 h-8 text-theme-muted m-auto" />
                    )}
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <SubmissionStatusBadge status={sub.status} />
                    </div>

                    <h3 className="text-base font-bold text-theme-heading font-montserrat truncate">{sub.title}</h3>
                    <p className="text-xs text-theme-muted line-clamp-2">{sub.description}</p>
                    <div className="text-xs font-extrabold text-amber-500 font-stats pt-1">₹{sub.price}</div>
                  </div>
                </div>

                {sub.rejectionReason && (
                  <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
                    <strong>Rejection Reason:</strong> {sub.rejectionReason}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-theme/40">
                  {isEditable && (
                    <Link
                      href={`/author/books/${sub.id}/edit`}
                      className="px-4 py-2 rounded-xl bg-theme-surface border border-theme/60 text-theme-heading hover:bg-slate-500/10 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit & Resubmit</span>
                    </Link>
                  )}

                  {sub.bookId && (
                    <Link
                      href={`/books/${sub.bookId}`}
                      target="_blank"
                      className="px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 hover:bg-blue-600 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Live Store Page</span>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
