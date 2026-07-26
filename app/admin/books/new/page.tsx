import React from 'react';
import BookForm from '@/components/admin/BookForm';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function CreateBookPage() {
  const [authors, categories] = await Promise.all([
    prisma.author.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
    prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
  ]);

  return (
    <div className="space-y-6 text-theme-text">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/books"
          className="p-2.5 rounded-2xl border border-theme/60 hover:bg-slate-500/10 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-theme-heading font-montserrat">Add New eBook</h1>
          <p className="text-xs text-theme-muted">Configure metadata, cover, pricing, and chapter content</p>
        </div>
      </div>

      <BookForm authors={authors} categories={categories} />
    </div>
  );
}
