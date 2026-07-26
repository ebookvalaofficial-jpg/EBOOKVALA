'use client';

import React, { useState, useEffect } from 'react';
import DataTable, { ColumnDef } from '@/components/admin/DataTable';
import CategoryForm from '@/components/admin/CategoryForm';
import ConfirmActionDialog from '@/components/admin/ConfirmActionDialog';
import AdminBreadcrumbs from '@/components/admin/AdminBreadcrumbs';
import { Plus, Edit3, Trash2, FolderTree, X } from 'lucide-react';

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  description?: string | null;
  _count: { books: number };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<CategoryRow | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryRow | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (res.ok && data.categories) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!selectedCategory) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/categories?id=${selectedCategory.id}`, { method: 'DELETE' });
      if (res.ok) {
        setIsDeleteModalOpen(false);
        setSelectedCategory(null);
        fetchCategories();
      }
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: ColumnDef<CategoryRow>[] = [
    {
      header: 'Category Name',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 font-bold flex items-center justify-center text-xs border border-purple-500/20 shrink-0">
            <FolderTree className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-theme-heading text-xs">{row.name}</p>
            <p className="text-[10px] text-theme-muted">{row.slug}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Icon Name',
      cell: (row) => (
        <span className="font-mono text-xs font-semibold text-theme-heading">
          {row.icon || 'BookOpen'}
        </span>
      ),
    },
    {
      header: 'Books Count',
      cell: (row) => (
        <span className="px-2.5 py-1 rounded-xl bg-purple-500/10 text-purple-400 text-xs font-bold border border-purple-500/20">
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
              setEditingCategory(row);
              setIsFormOpen(true);
            }}
            className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 hover:bg-blue-600 hover:text-white transition-colors"
            title="Edit Category"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              setSelectedCategory(row);
              setIsDeleteModalOpen(true);
            }}
            className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-600 hover:text-white transition-colors"
            title="Delete Category"
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
        title="Categories Management"
        description="Manage storefront genre taxonomies, slugs, descriptions, and icon mappings"
        action={
          <button
            onClick={() => {
              setEditingCategory(null);
              setIsFormOpen(!isFormOpen);
            }}
            className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2"
          >
            {isFormOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{isFormOpen ? 'Close Form' : 'Add Category'}</span>
          </button>
        }
      />

      {isFormOpen && (
        <div className="animate-scale-up">
          <CategoryForm initialData={editingCategory || undefined} />
        </div>
      )}

      {isLoading ? (
        <div className="p-12 text-center text-xs font-bold text-theme-muted bg-theme-card rounded-3xl border border-theme animate-pulse">
          Loading categories...
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={categories}
          searchPlaceholder="Search categories..."
          searchFilterKey={(row) => `${row.name} ${row.slug}`}
          pageSize={10}
          emptyTitle="No Categories Found"
          emptyDescription="No categories match your search."
          emptyIcon={FolderTree}
        />
      )}

      <ConfirmActionDialog
        isOpen={isDeleteModalOpen}
        title="Delete Category"
        description={
          <span>
            Are you sure you want to delete category &quot;<strong className="text-white">{selectedCategory?.name}</strong>&quot;?
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
