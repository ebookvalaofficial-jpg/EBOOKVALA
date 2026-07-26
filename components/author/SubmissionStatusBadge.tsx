'use client';

import React from 'react';
import { Clock, CheckCircle2, XCircle, BookCheck, FileEdit } from 'lucide-react';

interface SubmissionStatusBadgeProps {
  status: string; // DRAFT, SUBMITTED, IN_REVIEW, APPROVED, REJECTED, PUBLISHED
}

export default function SubmissionStatusBadge({ status }: SubmissionStatusBadgeProps) {
  switch (status) {
    case 'DRAFT':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-500/10 border border-slate-500/20 text-slate-400 text-[10px] font-black uppercase">
          <FileEdit className="w-3 h-3" />
          Draft
        </span>
      );
    case 'SUBMITTED':
    case 'IN_REVIEW':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase">
          <Clock className="w-3 h-3 animate-spin" />
          In Review
        </span>
      );
    case 'APPROVED':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-black uppercase">
          <CheckCircle2 className="w-3 h-3" />
          Approved
        </span>
      );
    case 'PUBLISHED':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase">
          <BookCheck className="w-3 h-3" />
          Published & Live
        </span>
      );
    case 'REJECTED':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase">
          <XCircle className="w-3 h-3" />
          Changes Requested / Rejected
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-500/10 text-slate-400 text-[10px] font-black uppercase">
          {status}
        </span>
      );
  }
}
