import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import ReadingClubCard from '@/components/community/ReadingClubCard';
import { Users, Plus } from 'lucide-react';

export default async function ReadingClubsPage() {
  const clubs = await prisma.readingClub.findMany({
    include: {
      createdByUser: { select: { id: true, name: true, image: true } },
      currentBook: { select: { id: true, title: true, slug: true, coverImageUrl: true } },
      _count: { select: { members: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main className="min-h-screen bg-theme-bg py-8 px-4 sm:px-6 font-inter text-theme-text">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-theme-heading font-montserrat">Reading Clubs</h1>
            <p className="text-xs text-theme-muted">Join reading circles, discuss featured books, and read together.</p>
          </div>

          <Link
            href="/community/clubs/new"
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white text-xs font-extrabold shadow-lg transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Reading Club</span>
          </Link>
        </div>

        {clubs.length === 0 ? (
          <div className="p-12 text-center space-y-3 rounded-3xl bg-theme-card border border-theme glass-card shadow-xl">
            <Users className="w-10 h-10 text-amber-500 mx-auto" />
            <h3 className="text-base font-bold text-theme-heading">No Reading Clubs Yet</h3>
            <p className="text-xs text-theme-muted">Be the first to start a reading club on EbookVala!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {clubs.map((c) => (
              <ReadingClubCard key={c.id} club={c} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
