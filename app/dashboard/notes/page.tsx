import React from 'react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import NotesList, { NoteItem } from '@/components/dashboard/NotesList';
import { Highlighter } from 'lucide-react';

export default async function NotesPage() {
  const session = await auth();

  const user = await prisma.user.findUnique({
    where: { email: session!.user!.email! },
  });

  if (!user) return null;

  const highlights = await prisma.highlight.findMany({
    where: { userId: user.id },
    include: {
      book: { select: { id: true, title: true, coverImageUrl: true } },
      chapter: { select: { title: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const formattedNotes: NoteItem[] = highlights.map((h) => ({
    id: h.id,
    bookId: h.book.id,
    bookTitle: h.book.title,
    coverImageUrl: h.book.coverImageUrl,
    chapterTitle: h.chapter.title,
    selectedText: h.selectedText,
    color: h.color,
    note: h.note,
    createdAt: h.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6 text-theme-text">
      <div>
        <h1 className="text-2xl font-black text-theme-heading font-montserrat flex items-center gap-2">
          <Highlighter className="w-6 h-6 text-primary-blue" />
          <span>All Notes & Highlights</span>
        </h1>
        <p className="text-xs text-theme-muted">
          Review, search, and jump to your annotated insights across all your purchased eBooks.
        </p>
      </div>

      <NotesList initialNotes={formattedNotes} />
    </div>
  );
}
