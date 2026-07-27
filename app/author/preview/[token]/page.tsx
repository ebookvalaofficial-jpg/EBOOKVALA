import React from 'react';
import { prisma } from '@/lib/prisma';
import { BookOpen, Sparkles, AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

export default async function BetaReaderPreviewPage({ params }: { params: { token: string } }) {
  const { token } = params;

  const previewLink = await prisma.authorPreviewLink.findUnique({
    where: { token },
    include: {
      bookSubmission: {
        include: {
          authorUser: { select: { name: true, image: true } },
          category: { select: { name: true } },
        },
      },
    },
  });

  if (!previewLink || (previewLink.expiresAt && previewLink.expiresAt < new Date())) {
    return (
      <div className="min-h-screen bg-theme-bg text-theme-body flex flex-col justify-between pt-28 pb-16">
        <Navbar />
        <main className="max-w-xl mx-auto px-4 text-center space-y-4 my-auto">
          <div className="p-4 rounded-3xl bg-rose-500/10 text-rose-500 border border-rose-500/20 inline-block">
            <AlertTriangle className="w-10 h-10 mx-auto" />
          </div>
          <h1 className="text-2xl font-extrabold text-theme-heading font-montserrat">
            Preview Link Expired or Invalid
          </h1>
          <p className="text-xs text-theme-muted">
            This beta-reader preview link is either invalid, deleted, or has passed its expiration date.
          </p>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs inline-flex items-center gap-2 mt-4"
          >
            <ArrowLeft className="w-4 h-4" /> Return to EbookVala Home
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const sub = previewLink.bookSubmission;

  return (
    <div className="min-h-screen bg-theme-bg text-theme-body flex flex-col justify-between pt-28 pb-16 font-inter">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-8 flex-1">
        {/* Beta Notice Banner */}
        <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 shrink-0 text-amber-400" />
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 font-mono block">
                Exclusive Beta Reader Access
              </span>
              <h2 className="text-sm font-bold text-theme-heading">Unpublished Draft Manuscript Preview</h2>
            </div>
          </div>
          <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 hidden sm:inline-block">
            Read-Only Feedback Mode
          </span>
        </div>

        {/* Book Header */}
        <div className="p-6 sm:p-8 rounded-3xl bg-theme-card border border-theme glass-card space-y-4">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {sub.coverImageUrl ? (
              <img
                src={sub.coverImageUrl}
                alt={sub.title}
                className="w-32 h-44 object-cover rounded-2xl border border-theme shadow-md shrink-0"
              />
            ) : (
              <div className="w-32 h-44 rounded-2xl bg-slate-800 border border-theme flex items-center justify-center text-xs text-theme-muted shrink-0 font-bold">
                Cover Draft
              </div>
            )}

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-blue-500/10 text-primary-blue text-[10px] font-bold border border-blue-500/20">
                {sub.category.name}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-theme-heading font-montserrat">
                {sub.title}
              </h1>
              <p className="text-xs text-theme-muted font-medium">
                By <strong className="text-theme-heading">{sub.authorUser.name || 'Author'}</strong>
              </p>
              <p className="text-xs text-theme-muted leading-relaxed pt-2 border-t border-theme/60">
                {sub.description}
              </p>
            </div>
          </div>
        </div>

        {/* Draft Manuscript Reader Content */}
        <div className="p-6 sm:p-10 rounded-3xl bg-theme-card border border-theme glass-card space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-theme">
            <h3 className="text-base font-extrabold text-theme-heading font-montserrat flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary-blue" /> Manuscript Draft Content
            </h3>
            <span className="text-xs text-theme-muted font-mono">Draft Mode</span>
          </div>

          <div className="prose dark:prose-invert max-w-none text-sm text-theme-heading leading-relaxed whitespace-pre-wrap font-serif">
            {sub.manuscriptChapters || 'No manuscript text provided for this draft.'}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
