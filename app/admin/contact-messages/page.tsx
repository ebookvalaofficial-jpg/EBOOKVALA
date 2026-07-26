'use client';

import React, { useState, useEffect } from 'react';
import DataTable, { ColumnDef } from '@/components/admin/DataTable';
import AdminBreadcrumbs from '@/components/admin/AdminBreadcrumbs';
import { Mail, RefreshCw } from 'lucide-react';
import { formatRelativeTime, formatFullDate } from '@/lib/formatters';

interface ContactMessageRow {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
}

export default function AdminContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessageRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/admin/contact-messages');
      const data = await res.json();
      if (res.ok && data.messages) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error('Failed to fetch contact messages:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/contact-messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        fetchMessages();
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const columns: ColumnDef<ContactMessageRow>[] = [
    {
      header: 'Sender Details',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-primary-blue font-bold flex items-center justify-center text-xs border border-blue-500/20 shrink-0">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-theme-heading text-xs">{row.name}</p>
            <p className="text-[10px] text-theme-muted">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Subject & Topic',
      cell: (row) => (
        <span className="px-2.5 py-1 rounded-xl bg-slate-500/10 text-theme-heading text-xs font-semibold border border-theme">
          {row.subject}
        </span>
      ),
    },
    {
      header: 'Message Snippet',
      cell: (row) => (
        <p className="text-xs text-theme-body max-w-xs truncate" title={row.message}>
          {row.message}
        </p>
      ),
    },
    {
      header: 'Date Submitted',
      cell: (row) => (
        <span className="text-[11px] text-theme-muted" title={formatFullDate(row.createdAt)}>
          {formatRelativeTime(row.createdAt)}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (row) => {
        const isNew = row.status === 'NEW';
        const isRead = row.status === 'READ';

        return (
          <select
            value={row.status}
            onChange={(e) => handleStatusChange(row.id, e.target.value)}
            className={`px-3 py-1 rounded-xl text-xs font-bold border transition-colors cursor-pointer focus:outline-none ${
              isNew
                ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                : isRead
                ? 'bg-blue-500/10 text-primary-blue border-blue-500/30'
                : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
            }`}
          >
            <option value="NEW" className="bg-slate-900 text-white">NEW</option>
            <option value="READ" className="bg-slate-900 text-white">READ</option>
            <option value="RESPONDED" className="bg-slate-900 text-white">RESPONDED</option>
          </select>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 text-theme-text font-inter">
      <AdminBreadcrumbs
        title="Contact Submissions"
        description="Review user support inquiries, technical feedback, and partnership contact messages"
        action={
          <button
            onClick={fetchMessages}
            className="px-4 py-2.5 rounded-2xl bg-theme-surface border border-theme text-theme-heading hover:bg-blue-600 hover:text-white text-xs font-bold transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        }
      />

      {isLoading ? (
        <div className="p-12 text-center text-xs font-bold text-theme-muted bg-theme-card rounded-3xl border border-theme animate-pulse">
          Loading contact messages...
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={messages}
          searchPlaceholder="Search messages by name, email, or subject..."
          searchFilterKey={(row) => `${row.name} ${row.email} ${row.subject} ${row.message}`}
          pageSize={10}
          emptyTitle="No Submissions Found"
          emptyDescription="There are currently no user contact inquiries recorded."
          emptyIcon={Mail}
        />
      )}
    </div>
  );
}
