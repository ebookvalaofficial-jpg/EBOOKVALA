'use client';

import React, { useState, useEffect } from 'react';
import DataTable, { ColumnDef } from '@/components/admin/DataTable';
import AuthorForm from '@/components/admin/AuthorForm';
import ConfirmActionDialog from '@/components/admin/ConfirmActionDialog';
import AdminBreadcrumbs from '@/components/admin/AdminBreadcrumbs';
import { Plus, Edit3, Trash2, PenTool, X } from 'lucide-react';

interface AuthorRow {
  id: string;
  name: string;
  slug: string;
  bio?: string | null;
  avatarUrl?: string | null;
  _count: { books: number };
}

export default function AdminAuthorsPage() {
  const [authors, setAuthors] = useState<AuthorRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingAuthor, setEditingAuthor] = useState<AuthorRow | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState<AuthorRow | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchAuthors = async () => {
    try {
      const res = await fetch('/api/admin/authors');
      const data = await res.json();
      if (res.ok && data.authors) {
        setAuthors(data.authors);
      }
    } catch (err) {
      console.error('Failed to fetch authors:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthors();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!selectedAuthor) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/authors?id=${selectedAuthor.id}`, { method: 'DELETE' });
      if (res.ok) {
        setIsDeleteModalOpen(false);
        setSelectedAuthor(null);
        fetchAuthors();
      }
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: ColumnDef<AuthorRow>[] = [
    {
      header: 'Author Name',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-500 font-bold flex items-center justify-center text-xs border border-blue-500/20 shrink-0">
            {row.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div>
            <p className="font-bold text-theme-heading text-xs">{row.name}</p>
            <p className="text-[10px] text-theme-muted">{row.slug}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Biography',
      cell: (row) => (
        <p className="text-xs text-theme-muted line-clamp-1 max-w-md">{row.bio || 'No biography provided'}</p>
      ),
    },
    {
      header: 'Books Count',
      cell: (row) => (
        <span className="px-2.5 py-1 rounded-xl bg-blue-500/10 text-blue-500 text-xs font-bold border border-blue-500/20">
          {row._count?.books || 0} eBooks
        </span>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      cell: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => {
              setEditingAuthor(row);
              setIsFormOpen(true);
            }}
            className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 hover:bg-blue-600 hover:text-white transition-colors"
            title="Edit Author"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              setSelectedAuthor(row);
              setIsDeleteModalOpen(true);
            }}
            className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-600 hover:text-white transition-colors"
            title="Delete Author"
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
        title="Authors Directory"
        description="Manage eBook authors, bios, avatars, and author profiles"
        action={
          <button
            onClick={() => {
              setEditingAuthor(null);
              setIsFormOpen(!isFormOpen);
            }}
            className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2"
          >
            {isFormOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{isFormOpen ? 'Close Form' : 'Add Author'}</span>
          </button>
        }
      />

      {isFormOpen && (
        <div className="animate-scale-up">
          <AuthorForm initialData={editingAuthor || undefined} />
        </div>
      )}

      {isLoading ? (
        <div className="p-12 text-center text-xs font-bold text-theme-muted bg-theme-card rounded-3xl border border-theme animate-pulse">
          Loading authors...
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={authors}
          searchPlaceholder="Search authors by name or slug..."
          searchFilterKey={(row) => `${row.name} ${row.slug}`}
          pageSize={10}
          emptyTitle="No Authors Found"
          emptyDescription="There are no author profiles created yet."
          emptyIcon={PenTool}
        />
      )}

      <ConfirmActionDialog
        isOpen={isDeleteModalOpen}
        title="Delete Author"
        description={
          <span>
            Are you sure you want to delete &quot;<strong className="text-white">{selectedAuthor?.name}</strong>&quot;?
          </span>
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
