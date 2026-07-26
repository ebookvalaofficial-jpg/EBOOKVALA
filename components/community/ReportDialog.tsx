'use client';

import React, { useState } from 'react';
import { Flag, X, Send, RefreshCw, CheckCircle2 } from 'lucide-react';

interface ReportDialogProps {
  targetType: 'DISCUSSION' | 'REPLY' | 'REVIEW' | 'USER';
  targetId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReportDialog({
  targetType,
  targetId,
  isOpen,
  onClose,
}: ReportDialogProps) {
  const [reason, setReason] = useState<'Spam' | 'Harassment' | 'Inappropriate Content' | 'Other'>('Spam');
  const [details, setDetails] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/community/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType,
          targetId,
          reason,
          details: details || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to submit report');
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      setError('Network error submitting report');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-inter">
      <div className="w-full max-w-md p-6 rounded-3xl bg-theme-card border border-theme glass-card shadow-2xl space-y-4 text-theme-text relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-xl hover:bg-slate-500/10 text-theme-muted hover:text-theme-heading transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 text-red-500">
          <div className="p-2.5 rounded-2xl bg-red-500/10 border border-red-500/20">
            <Flag className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-theme-heading font-montserrat">Report Content</h3>
        </div>

        {success ? (
          <div className="p-6 text-center space-y-2 text-emerald-500">
            <CheckCircle2 className="w-10 h-10 mx-auto animate-bounce" />
            <h4 className="font-bold text-sm text-theme-heading">Report Submitted</h4>
            <p className="text-xs text-theme-muted">Thank you for helping keep our reading community safe.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-theme-heading">Reason for Report *</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-2xl bg-theme-surface border border-theme/60 text-xs font-semibold text-theme-heading focus:outline-none focus:border-red-500"
              >
                <option value="Spam">Spam or Unsolicited Promotion</option>
                <option value="Harassment">Harassment or Hate Speech</option>
                <option value="Inappropriate Content">Inappropriate / Explicit Content</option>
                <option value="Other">Other Policy Violation</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-theme-heading">Additional Context / Details</label>
              <textarea
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Provide any additional notes for our moderation team..."
                className="w-full px-4 py-2.5 rounded-2xl bg-theme-surface border border-theme/60 text-xs font-semibold text-theme-heading focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-theme-muted hover:text-theme-heading"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold shadow-lg disabled:opacity-40 transition-all flex items-center gap-1.5"
              >
                {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Submit Report</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
