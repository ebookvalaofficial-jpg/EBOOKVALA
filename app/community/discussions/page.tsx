import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import DiscussionCard from '@/components/community/DiscussionCard';
import { MessageSquare, Plus, BookOpen, Layers } from 'lucide-react';

interface DiscussionsPageProps {
  searchParams: Promise<{
    bookId?: string;
    categoryId?: string;
    query?: string;
  }>;
}

export default async function AllDiscussionsPage({ searchParams }: DiscussionsPageProps) {
  const { bookId, categoryId, query } = await searchParams;

  const whereClause: any = {
    authorUser: { isBanned: false },
  };

  if (bookId) whereClause.bookId = bookId;
  if (categoryId) whereClause.categoryId = categoryId;
  if (query) {
    whereClause.OR = [
      { title: { contains: query } },
      { body: { contains: query } },
    ];
  }

  const discussions = await prisma.discussion.findMany({
    where: whereClause,
    include: {
      authorUser: { select: { id: true, name: true, image: true, isAuthor: true } },
      book: { select: { id: true, title: true, slug: true, coverImageUrl: true } },
      category: { select: { id: true, name: true, slug: true } },
      _count: { select: { replies: true } },
    },
    orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
  });

  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });

  return (
    <main className="min-h-screen bg-theme-bg py-8 px-4 sm:px-6 font-inter text-theme-text">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-theme-heading font-montserrat">Community Discussions</h1>
            <p className="text-xs text-theme-muted">Explore book threads, category forums, and reader debates.</p>
          </div>

          <Link
            href="/community/discussions/new"
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white text-xs font-extrabold shadow-lg transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Discussion</span>
          </Link>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <Link
            href="/community/discussions"
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
              !categoryId && !bookId
                ? 'bg-amber-500 text-white shadow-sm font-extrabold'
                : 'bg-theme-card border border-theme/60 text-theme-muted hover:text-theme-heading'
            }`}
          >
            All Discussions
          </Link>

          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/community/discussions?categoryId=${c.id}`}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                categoryId === c.id
                  ? 'bg-amber-500 text-white shadow-sm font-extrabold'
                  : 'bg-theme-card border border-theme/60 text-theme-muted hover:text-theme-heading'
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>

        {/* Discussions List */}
        {discussions.length === 0 ? (
          <div className="p-12 text-center space-y-3 rounded-3xl bg-theme-card border border-theme glass-card shadow-xl">
            <MessageSquare className="w-10 h-10 text-amber-500 mx-auto" />
            <h3 className="text-base font-bold text-theme-heading">No Discussions Found</h3>
            <p className="text-xs text-theme-muted">Be the first to start a conversation in this topic!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {discussions.map((d) => (
              <DiscussionCard key={d.id} discussion={{ ...d, createdAt: d.createdAt.toISOString() }} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
