'use client';

import React, { useState, useEffect } from 'react';
import DataTable, { ColumnDef } from '@/components/admin/DataTable';
import AdminBreadcrumbs from '@/components/admin/AdminBreadcrumbs';
import { ShieldAlert, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { formatRelativeTime } from '@/lib/formatters';

interface DmcaRequestItem {
  id: string;
  name: string;
  email: string;
  copyrightedWork: string;
  infringingUrl: string;
  statement: string;
  signature: string;
  status: string;
  createdAt: string;
}

export default function AdminDmcaRequestsPage() {
  const [data, setData] = useState<DmcaRequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/dmca-requests');
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
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/dmca-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchRequests();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const columns: ColumnDef<DmcaRequestItem>[] = [
    {
      header: 'Claimant',
      accessorKey: 'name',
      cell: (row) => (
        <div>
          <p className="font-bold text-theme-heading text-xs">{row.name}</p>
          <p className="text-[11px] text-theme-muted">{row.email}</p>
        </div>
      ),
    },
    {
      header: 'Copyrighted Work',
      accessorKey: 'copyrightedWork',
      cell: (row) => (
        <p className="text-xs text-theme-body max-w-xs truncate" title={row.copyrightedWork}>
          {row.copyrightedWork}
        </p>
      ),
    },
    {
      header: 'Infringing URL',
      accessorKey: 'infringingUrl',
      cell: (row) => (
        <a href={row.infringingUrl} target="_blank" rel="noreferrer" className="text-xs text-primary-blue hover:underline max-w-xs truncate block">
          {row.infringingUrl}
        </a>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row) => {
        const statusColors: Record<string, string> = {
          PENDING: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
          REVIEWED: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
          RESOLVED: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
          REJECTED: 'bg-red-500/10 text-red-500 border-red-500/20',
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
          {row.status === 'PENDING' && (
            <>
              <button
                onClick={() => handleUpdateStatus(row.id, 'RESOLVED')}
                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold transition-colors flex items-center gap-1"
              >
                <CheckCircle className="w-3 h-3" /> Resolve
              </button>
              <button
                onClick={() => handleUpdateStatus(row.id, 'REJECTED')}
                className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[11px] font-bold transition-colors flex items-center gap-1"
              >
                <XCircle className="w-3 h-3" /> Reject
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <AdminBreadcrumbs
        title="DMCA Takedown Requests"
        description="Review and take action on copyright infringement claims."
        action={
          <button
            onClick={fetchRequests}
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
        searchPlaceholder="Search DMCA claims..."
        searchKey="name"
      />
    </div>
  );
}
