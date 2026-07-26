'use client';

import React, { useState, useEffect } from 'react';
import AdminBreadcrumbs from '@/components/admin/AdminBreadcrumbs';
import { RefreshCw, Trash2, ShieldAlert } from 'lucide-react';
import { formatRelativeTime, formatFullDate } from '@/lib/formatters';

interface ReportItem {
  id: string;
  targetType: string;
  targetId: string;
  reason: string;
  details?: string | null;
  status: string;
  createdAt: string;
  reporter: {
    id: string;
    name?: string | null;
    email: string;
  };
}

export default function AdminCommunityReportsPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/admin/community/reports');
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      }
    } catch (err) {
      console.error('Error fetching admin reports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleReviewReport = async (reportId: string, action: 'DISMISSED' | 'ACTION_TAKEN', deleteTarget: boolean = false) => {
    setActionLoadingId(reportId);
    setError(null);

    try {
      const res = await fetch(`/api/admin/community/reports/${reportId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, deleteTarget }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to process report');
        return;
      }

      fetchReports();
    } catch (err) {
      setError('Network error processing report');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6 font-inter text-theme-text">
      <AdminBreadcrumbs
        title="Community Moderation Reports"
        description="Review user-reported discussions, replies, reviews, and community posts"
      />

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="p-12 text-center text-xs text-theme-muted bg-theme-card rounded-3xl border border-theme animate-pulse">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-500 mb-2" />
          Loading moderation queue...
        </div>
      ) : reports.length === 0 ? (
        <div className="p-12 text-center space-y-3 rounded-3xl bg-theme-card border border-theme glass-card shadow-xl">
          <ShieldAlert className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-theme-heading font-montserrat">No Reports Pending</h3>
          <p className="text-xs text-theme-muted">All community moderation reports have been reviewed.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((rep) => (
            <div
              key={rep.id}
              className="p-6 rounded-3xl bg-theme-card border border-theme glass-card space-y-4 shadow-xl text-xs font-semibold"
            >
              <div className="flex items-center justify-between border-b border-theme/60 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase">
                    {rep.targetType}
                  </span>
                  <span className="font-bold text-theme-heading">Reason: {rep.reason}</span>
                </div>

                <span className="text-[11px] text-theme-muted" title={formatFullDate(rep.createdAt)}>
                  Reported {formatRelativeTime(rep.createdAt)} by {rep.reporter.name} ({rep.reporter.email})
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-theme-muted">Target ID: {rep.targetId}</span>
                {rep.details && (
                  <p className="text-xs text-theme-text font-semibold bg-theme-surface/40 p-3 rounded-2xl border border-theme/40">
                    &quot;{rep.details}&quot;
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-theme/40">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    rep.status === 'ACTION_TAKEN'
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      : rep.status === 'DISMISSED'
                      ? 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                      : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                  }`}
                >
                  {rep.status}
                </span>

                {rep.status === 'PENDING' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReviewReport(rep.id, 'DISMISSED')}
                      disabled={actionLoadingId === rep.id}
                      className="px-4 py-2 rounded-xl bg-theme-surface border border-theme/60 text-theme-muted hover:text-theme-heading text-xs font-bold transition-all"
                    >
                      Dismiss Report
                    </button>

                    <button
                      onClick={() => handleReviewReport(rep.id, 'ACTION_TAKEN', true)}
                      disabled={actionLoadingId === rep.id}
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Take Action & Delete Content</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
