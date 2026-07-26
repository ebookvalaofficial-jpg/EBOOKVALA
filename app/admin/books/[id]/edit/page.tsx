import React from 'react';
import BookForm from '@/components/admin/BookForm';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function EditBookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [book, authors, categories] = await Promise.all([
    prisma.book.findUnique({
      where: { id },
      include: { chapters: { orderBy: { order: 'asc' } } },
    }),
    prisma.author.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
    prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
  ]);

  if (!book) {
    notFound();
  }

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
          <h1 className="text-2xl font-black text-theme-heading font-montserrat">Edit eBook: {book.title}</h1>
          <p className="text-xs text-theme-muted">Update metadata, pricing, cover image, and chapter details</p>
        </div>
      </div>

      <BookForm
        authors={authors}
        categories={categories}
        initialData={{
          id: book.id,
          title: book.title,
          slug: book.slug,
          authorId: book.authorId,
          categoryId: book.categoryId,
          description: book.description,
          price: book.price,
          originalPrice: book.originalPrice,
          discountPercent: book.discountPercent,
          coverImageUrl: book.coverImageUrl,
          pageCount: book.pageCount,
          language: book.language,
          format: book.format,
          isBestseller: book.isBestseller,
          isFeatured: book.isFeatured,
          isTrending: book.isTrending,
          chapters: book.chapters.map((ch) => ({
            id: ch.id,
            order: ch.order,
            title: ch.title,
            content: ch.content,
          })),
        }}
      />
    </div>
  );
}
