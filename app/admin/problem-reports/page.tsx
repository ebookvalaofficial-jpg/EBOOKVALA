'use client';

import React, { useState, useEffect } from 'react';
import DataTable, { ColumnDef } from '@/components/admin/DataTable';
import AdminBreadcrumbs from '@/components/admin/AdminBreadcrumbs';
import { RefreshCw, CheckCircle2 } from 'lucide-react';
import { formatRelativeTime } from '@/lib/formatters';

interface ProblemReportItem {
  id: string;
  name?: string;
  email?: string;
  issueType: string;
  description: string;
  screenshotUrl?: string;
  browserInfo?: string;
  status: string;
  createdAt: string;
}

export default function AdminProblemReportsPage() {
  const [data, setData] = useState<ProblemReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/problem-reports');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/problem-reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchReports();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const columns: ColumnDef<ProblemReportItem>[] = [
    {
      header: 'Reporter',
      accessorKey: 'name',
      cell: (row) => (
        <div>
          <p className="font-bold text-theme-heading text-xs">{row.name || 'Anonymous'}</p>
          <p className="text-[11px] text-theme-muted">{row.email || 'N/A'}</p>
        </div>
      ),
    },
    {
      header: 'Issue Type',
      accessorKey: 'issueType',
      cell: (row) => (
        <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-blue-500/10 text-primary-blue">
          {row.issueType}
        </span>
      ),
    },
    {
      header: 'Description',
      accessorKey: 'description',
      cell: (row) => (
        <p className="text-xs text-theme-body max-w-sm truncate" title={row.description}>
          {row.description}
        </p>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row) => {
        const statusColors: Record<string, string> = {
          PENDING: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
          INVESTIGATING: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
          RESOLVED: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
          CLOSED: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
        };
        return (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColors[row.status] || 'bg-slate-500/10 text-slate-400'}`}>
            {row.status}
          </span>
        );
      },
    },
    {
      header: 'Submitted',
      accessorKey: 'createdAt',
      cell: (row) => (
        <span className="text-xs text-theme-muted font-mono">{formatRelativeTime(row.createdAt)}</span>
      ),
    },
    {
      header: 'Actions',
      accessorKey: 'id',
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          {row.status !== 'RESOLVED' && (
            <button
              onClick={() => handleUpdateStatus(row.id, 'RESOLVED')}
              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold transition-colors flex items-center gap-1"
            >
              <CheckCircle2 className="w-3 h-3" /> Mark Resolved
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <AdminBreadcrumbs
        title="User Problem Reports"
        description="Review bug reports, payment issues, and technical feedback from users."
        action={
          <button
            onClick={fetchReports}
            className="px-3.5 py-2 rounded-xl border border-theme bg-theme-card hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-theme-heading flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh List
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        searchPlaceholder="Search problem reports..."
        searchKey="description"
      />
    </div>
  );
}
