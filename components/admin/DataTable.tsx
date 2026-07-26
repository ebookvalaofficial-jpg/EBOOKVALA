'use client';

import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, Inbox } from 'lucide-react';

export interface ColumnDef<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  isLoading?: boolean;
  searchPlaceholder?: string;
  searchFilterKey?: keyof T | ((row: T) => string);
  searchKey?: keyof T;
  pageSize?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: React.ElementType;
}

export default function DataTable<T extends { id?: string }>({
  columns,
  data,
  isLoading = false,
  searchPlaceholder = 'Search records...',
  searchFilterKey,
  searchKey,
  pageSize = 10,
  emptyTitle = 'No Records Found',
  emptyDescription = 'There are currently no items matching this criteria.',
  emptyIcon: EmptyIcon = Inbox,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const effectiveFilterKey = searchFilterKey || searchKey;

  // Search Filter
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase();

    return data.filter((row) => {
      if (typeof effectiveFilterKey === 'function') {
        return effectiveFilterKey(row).toLowerCase().includes(q);
      }
      if (effectiveFilterKey) {
        const val = row[effectiveFilterKey];
        return val ? String(val).toLowerCase().includes(q) : false;
      }
      return Object.values(row as any).some((val) =>
        val ? String(val).toLowerCase().includes(q) : false
      );
    });
  }, [data, searchQuery, effectiveFilterKey]);

  // Sort
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      return sortOrder === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [filteredData, sortKey, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-4 text-theme-text font-inter">
      {/* Top Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-3xl bg-theme-card border border-theme glass-card">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-theme-surface border border-theme/60 text-xs font-semibold text-theme-heading placeholder:text-theme-muted focus:outline-none focus:border-blue-500"
          />
        </div>
        <span className="text-xs font-bold text-theme-muted shrink-0">
          Showing {paginatedData.length} of {filteredData.length} entries
        </span>
      </div>

      {/* Table Surface */}
      <div className="rounded-3xl bg-theme-card border border-theme glass-card overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-theme/60 bg-slate-500/5 text-[11px] font-extrabold uppercase tracking-wider text-theme-muted">
                {columns.map((col, idx) => (
                  <th
                    key={idx}
                    className={`p-4 ${
                      col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                    }`}
                  >
                    {col.sortable && col.accessorKey ? (
                      <button
                        onClick={() => handleSort(col.accessorKey!)}
                        className={`inline-flex items-center gap-1 hover:text-theme-heading transition-colors ${
                          col.align === 'right' ? 'justify-end w-full' : col.align === 'center' ? 'justify-center w-full' : ''
                        }`}
                      >
                        <span>{col.header}</span>
                        <ArrowUpDown className="w-3 h-3 text-theme-muted" />
                      </button>
                    ) : (
                      <span>{col.header}</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-theme/30 text-xs font-semibold">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, rIdx) => (
                  <tr key={rIdx} className="animate-pulse">
                    {columns.map((_, cIdx) => (
                      <td key={cIdx} className="p-4">
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="p-12 text-center">
                    <div className="max-w-sm mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-500/10 text-theme-muted flex items-center justify-center mx-auto border border-theme/40">
                        <EmptyIcon className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-theme-heading font-montserrat">{emptyTitle}</h4>
                      <p className="text-xs text-theme-muted">{emptyDescription}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, rowIdx) => (
                  <tr
                    key={row.id || rowIdx}
                    className="hover:bg-blue-500/[0.04] transition-colors even:bg-slate-500/[0.02]"
                  >
                    {columns.map((col, colIdx) => (
                      <td
                        key={colIdx}
                        className={`p-4 align-middle ${
                          col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                        }`}
                      >
                        {col.cell ? col.cell(row) : col.accessorKey ? String(row[col.accessorKey] ?? '') : null}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-theme/60 flex items-center justify-between text-xs font-bold text-theme-muted">
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-theme/60 hover:bg-slate-500/10 disabled:opacity-40 transition-colors"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl border border-theme/60 hover:bg-slate-500/10 disabled:opacity-40 transition-colors"
                aria-label="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
