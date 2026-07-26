'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DataTable, { ColumnDef } from '@/components/admin/DataTable';
import UserRoleBadge from '@/components/admin/UserRoleBadge';
import AdminBreadcrumbs from '@/components/admin/AdminBreadcrumbs';
import { Eye, Users } from 'lucide-react';
import { formatCurrency, formatRelativeTime, formatFullDate } from '@/lib/formatters';

interface UserRow {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  isBanned: boolean;
  provider: string;
  createdAt: string;
  plan: string;
  totalSpentRupees: number;
  purchasesCount: number;
  ordersCount: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (res.ok && data.users) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = roleFilter === 'ALL'
    ? users
    : roleFilter === 'BANNED'
    ? users.filter((u) => u.isBanned)
    : users.filter((u) => u.role === roleFilter && !u.isBanned);

  const columns: ColumnDef<UserRow>[] = [
    {
      header: 'User',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-500 font-bold flex items-center justify-center text-xs border border-blue-500/20 shrink-0">
            {row.name?.[0]?.toUpperCase() || row.email[0].toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-theme-heading text-xs">{row.name || 'User'}</p>
            <p className="text-[11px] text-theme-muted">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Role / Status',
      cell: (row) => <UserRoleBadge role={row.role} isBanned={row.isBanned} />,
    },
    {
      header: 'Plan',
      cell: (row) => (
        <span className="px-2.5 py-1 rounded-xl bg-slate-500/10 border border-theme/40 text-[11px] font-bold">
          {row.plan}
        </span>
      ),
    },
    {
      header: 'Total Spent',
      accessorKey: 'totalSpentRupees',
      sortable: true,
      align: 'right',
      cell: (row) => <span className="font-black text-theme-heading text-xs">{formatCurrency(row.totalSpentRupees)}</span>,
    },
    {
      header: 'Purchases',
      cell: (row) => <span className="text-xs font-semibold">{row.purchasesCount} eBooks</span>,
    },
    {
      header: 'Signup Date',
      cell: (row) => (
        <span className="text-[11px] text-theme-muted" title={formatFullDate(row.createdAt)}>
          {formatRelativeTime(row.createdAt)}
        </span>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      cell: (row) => (
        <Link
          href={`/admin/users/${row.id}`}
          className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 hover:bg-blue-600 hover:text-white transition-colors inline-flex items-center gap-1 text-xs font-bold"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Profile</span>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-theme-text font-inter">
      <AdminBreadcrumbs
        title="User Accounts & Roles"
        description="Manage platform members, subscription plans, roles, permissions, and account suspensions"
        action={
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-2xl bg-theme-surface border border-theme/60 text-xs font-bold text-theme-heading focus:outline-none"
          >
            <option value="ALL">All Accounts</option>
            <option value="USER">Standard Users</option>
            <option value="ADMIN">Admins</option>
            <option value="SUPER_ADMIN">Super Admins</option>
            <option value="BANNED">Banned Accounts</option>
          </select>
        }
      />

      {isLoading ? (
        <div className="p-12 text-center text-xs font-bold text-theme-muted bg-theme-card rounded-3xl border border-theme animate-pulse">
          Loading user accounts...
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredUsers}
          searchPlaceholder="Search users by name, email, or role..."
          searchFilterKey={(row) => `${row.name} ${row.email} ${row.role}`}
          pageSize={10}
          emptyTitle="No Accounts Found"
          emptyDescription="No user accounts match the selected role filter criteria."
          emptyIcon={Users}
        />
      )}
    </div>
  );
}
