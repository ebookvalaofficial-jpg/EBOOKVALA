'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import DataTable, { ColumnDef } from '@/components/admin/DataTable';
import ConfirmActionDialog from '@/components/admin/ConfirmActionDialog';
import AdminBreadcrumbs from '@/components/admin/AdminBreadcrumbs';
import { Plus, Edit3, Trash2, Eye, BookOpen } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';

interface BookRow {
  id: string;
  coverImageUrl: string;
  title: string;
  slug: string;
  price: number;
  rating: number;
  isBestseller: boolean;
  isFeatured: boolean;
  isTrending: boolean;
  isDeleted: boolean;
  author: { name: string };
  category: { name: string };
  chapters: { id: string }[];
  _count: { purchases: number; reviews: number };
}

export default function AdminBooksPage() {
  const [books, setBooks] = useState<BookRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState<BookRow | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');

  const fetchBooks = async () => {
    try {
      const res = await fetch('/api/admin/books');
      const data = await res.json();
      if (res.ok && data.books) {
        setBooks(data.books);
      }
    } catch (err) {
      console.error('Failed to fetch books:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!selectedBook) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/books/${selectedBook.id}`, { method: 'DELETE' });
      if (res.ok) {
        setIsDeleteModalOpen(false);
        setSelectedBook(null);
        fetchBooks();
      }
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const categories = Array.from(new Set(books.map((b) => b.category?.name).filter(Boolean)));

  const filteredBooks = selectedCategoryFilter === 'ALL'
    ? books
    : books.filter((b) => b.category?.name === selectedCategoryFilter);

  const columns: ColumnDef<BookRow>[] = [
    {
      header: 'Book Title',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-14 rounded-lg overflow-hidden bg-theme-surface border border-theme/60 shrink-0 shadow-sm">
            <Image src={row.coverImageUrl} alt={row.title} fill unoptimized className="object-cover" />
          </div>
          <div>
            <p className="font-bold text-theme-heading text-xs line-clamp-1">{row.title}</p>
            <p className="text-[11px] text-theme-muted">{row.author?.name || 'Unknown'}</p>
            {row.isDeleted && (
              <span className="text-[9px] font-black uppercase text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded">
                Soft-Deleted
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Category',
      cell: (row) => (
        <span className="px-2.5 py-1 rounded-xl bg-slate-500/10 border border-theme/40 text-[11px] font-bold">
          {row.category?.name || 'Uncategorized'}
        </span>
      ),
    },
    {
      header: 'Price',
      accessorKey: 'price',
      sortable: true,
      align: 'right',
      cell: (row) => <span className="font-black text-theme-heading text-xs">{formatCurrency(row.price)}</span>,
    },
    {
      header: 'Promotional Badges',
      cell: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.isBestseller && (
            <span className="px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] font-extrabold uppercase">
              Bestseller
            </span>
          )}
          {row.isFeatured && (
            <span className="px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20 text-[9px] font-extrabold uppercase">
              Featured
            </span>
          )}
          {row.isTrending && (
            <span className="px-2 py-0.5 rounded-lg bg-purple-500/10 text-purple-500 border border-purple-500/20 text-[9px] font-extrabold uppercase">
              Trending
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Chapters & Sales',
      cell: (row) => (
        <div className="text-[11px]">
          <p className="font-bold text-theme-heading">{row.chapters?.length || 0} Chapters</p>
          <p className="text-theme-muted">{row._count?.purchases || 0} Purchases</p>
        </div>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      cell: (row) => (
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/books/${row.slug}`}
            target="_blank"
            className="p-2 rounded-xl border border-theme/60 hover:bg-slate-500/10 text-theme-muted hover:text-theme-heading transition-colors"
            title="View Public Page"
          >
            <Eye className="w-3.5 h-3.5" />
          </Link>

          <Link
            href={`/admin/books/${row.id}/edit`}
            className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 hover:bg-blue-600 hover:text-white transition-colors"
            title="Edit Book & Chapters"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={() => {
              setSelectedBook(row);
              setIsDeleteModalOpen(true);
            }}
            className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-600 hover:text-white transition-colors"
            title="Delete Book"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-theme-text font-inter">
      <AdminBreadcrumbs
        title="eBook Catalog Management"
        description="Create, edit, manage chapters, and publish books to the storefront"
        action={
          <div className="flex items-center gap-3">
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="px-3.5 py-2.5 rounded-2xl bg-theme-surface border border-theme/60 text-xs font-bold text-theme-heading focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <Link
              href="/admin/books/new"
              className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create eBook</span>
            </Link>
          </div>
        }
      />

      {isLoading ? (
        <div className="p-12 text-center text-xs font-bold text-theme-muted bg-theme-card rounded-3xl border border-theme animate-pulse">
          Loading eBook catalog...
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredBooks}
          searchPlaceholder="Search by title, author, or category..."
          searchFilterKey={(row) => `${row.title} ${row.author?.name} ${row.category?.name}`}
          pageSize={10}
          emptyTitle="No eBooks Found"
          emptyDescription="There are no eBooks matching the selected category or search query."
          emptyIcon={BookOpen}
        />
      )}

      <ConfirmActionDialog
        isOpen={isDeleteModalOpen}
        title="Delete eBook"
        description={
          selectedBook?._count?.purchases && selectedBook._count.purchases > 0 ? (
            <span>
              This book has <strong className="text-white">{selectedBook._count.purchases} active customer purchases</strong>. To protect existing readers, it will be <strong className="text-amber-400">soft-deleted</strong> (hidden from store, but preserved for existing owners).
            </span>
          ) : (
            <span>
              Are you sure you want to permanently delete &quot;<strong className="text-white">{selectedBook?.title}</strong>&quot;? This action cannot be undone.
            </span>
          )
        }
        confirmText="Confirm Delete"
        confirmButtonClass="bg-red-600 hover:bg-red-500 text-white"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
}
