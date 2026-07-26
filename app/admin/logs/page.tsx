'use client';

import React, { useState, useEffect } from 'react';
import DataTable, { ColumnDef } from '@/components/admin/DataTable';
import UserRoleBadge from '@/components/admin/UserRoleBadge';
import AdminBreadcrumbs from '@/components/admin/AdminBreadcrumbs';
import { ShieldCheck } from 'lucide-react';
import { formatRelativeTime, formatFullDate } from '@/lib/formatters';

interface AuditLogRow {
  id: string;
  action: string;
  targetType: string;
  targetId: string;
  details?: string | null;
  createdAt: string;
  adminUser: {
    id: string;
    name: string | null;
    email: string;
    role: string;
  };
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState<string>('ALL');

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/admin/logs');
      const data = await res.json();
      if (res.ok && data.logs) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const actionTypes = Array.from(new Set(logs.map((l) => l.action)));

  const filteredLogs = actionFilter === 'ALL'
    ? logs
    : logs.filter((l) => l.action === actionFilter);

  const columns: ColumnDef<AuditLogRow>[] = [
    {
      header: 'Timestamp',
      cell: (row) => (
        <span className="text-[11px] font-semibold text-theme-muted" title={formatFullDate(row.createdAt)}>
          {formatRelativeTime(row.createdAt)}
        </span>
      ),
    },
    {
      header: 'Admin Account',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <div>
            <p className="font-bold text-theme-heading text-xs">{row.adminUser?.name || 'Admin'}</p>
            <p className="text-[10px] text-theme-muted">{row.adminUser?.email}</p>
          </div>
          <UserRoleBadge role={row.adminUser?.role} />
        </div>
      ),
    },
    {
      header: 'Action Type',
      cell: (row) => (
        <span className="px-2.5 py-1 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 text-[10px] font-black uppercase tracking-wider font-mono">
          {row.action}
        </span>
      ),
    },
    {
      header: 'Target Resource',
      cell: (row) => (
        <span className="text-xs font-bold text-theme-heading">
          {row.targetType} <span className="font-mono text-theme-muted text-[10px]">(#{row.targetId.slice(-6)})</span>
        </span>
      ),
    },
    {
      header: 'Details Context',
      cell: (row) => (
        <p className="text-xs text-theme-muted max-w-sm truncate font-mono bg-theme-surface/50 p-1.5 rounded-lg border border-theme/40">
          {row.details || 'N/A'}
        </p>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-theme-text font-inter">
      <AdminBreadcrumbs
        title="System Audit & Action Logs"
        description="Immutable trail of administrative operations, catalog modifications, and security actions"
        action={
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-2xl bg-theme-surface border border-theme/60 text-xs font-bold text-theme-heading focus:outline-none"
          >
            <option value="ALL">All Action Types</option>
            {actionTypes.map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </select>
        }
      />

      {isLoading ? (
        <div className="p-12 text-center text-xs font-bold text-theme-muted bg-theme-card rounded-3xl border border-theme animate-pulse">
          Loading audit logs...
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredLogs}
          searchPlaceholder="Search logs by admin, action, or target ID..."
          searchFilterKey={(row) => `${row.adminUser?.name} ${row.adminUser?.email} ${row.action} ${row.targetType} ${row.targetId}`}
          pageSize={15}
          emptyTitle="No Action Logs Found"
          emptyDescription="No administrative action logs match the selected filter."
          emptyIcon={ShieldCheck}
        />
      )}
    </div>
  );
}
