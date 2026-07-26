'use client';

import React, { useState } from 'react';
import { User, CheckCircle2, XCircle, Globe, ExternalLink, RefreshCw } from 'lucide-react';

interface AuthorApplicationReviewCardProps {
  application: {
    id: string;
    penName: string;
    bio: string;
    sampleWorkUrl?: string | null;
    sampleWorkText?: string | null;
    socialLinks?: string | null;
    status: string;
    createdAt: string;
    user: {
      name?: string | null;
      email: string;
    };
  };
  onReviewed?: () => void;
}

export default function AuthorApplicationReviewCard({
  application,
  onReviewed,
}: AuthorApplicationReviewCardProps) {
  const [reviewNote, setReviewNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReview = async (action: 'APPROVE' | 'REJECT') => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/author-applications/${application.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reviewNote }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to process application decision');
        return;
      }

      if (onReviewed) onReviewed();
    } catch (err) {
      setError('Network error updating application status');
    } finally {
      setIsLoading(false);
    }
  };

  const social = application.socialLinks ? JSON.parse(application.socialLinks) : {};

  return (
    <div className="p-6 rounded-3xl bg-theme-card border border-theme glass-card space-y-5 text-theme-text font-inter shadow-xl">
      <div className="flex items-center justify-between border-b border-theme/60 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 font-extrabold flex items-center justify-center text-sm">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-theme-heading font-montserrat">{application.penName}</h3>
            <p className="text-xs text-theme-muted">{application.user.name} ({application.user.email})</p>
          </div>
        </div>

        <span className="text-[10px] font-bold text-theme-muted">
          Applied {new Date(application.createdAt).toLocaleDateString()}
        </span>
      </div>

      {error && (
        <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold">
          {error}
        </div>
      )}

      {/* Bio */}
      <div className="space-y-1">
        <span className="text-[10px] font-black uppercase text-theme-muted">Author Bio</span>
        <p className="text-xs font-semibold text-theme-heading leading-relaxed bg-theme-surface/40 p-3 rounded-2xl border border-theme/40">
          {application.bio}
        </p>
      </div>

      {/* Writing Sample */}
      <div className="space-y-1">
        <span className="text-[10px] font-black uppercase text-theme-muted">Writing Sample</span>
        {application.sampleWorkUrl && (
          <a
            href={application.sampleWorkUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-500 hover:underline"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{application.sampleWorkUrl}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
        {application.sampleWorkText && (
          <p className="text-xs font-mono text-theme-muted bg-theme-surface/70 p-3 rounded-2xl border border-theme/60 max-h-36 overflow-y-auto whitespace-pre-line">
            {application.sampleWorkText}
          </p>
        )}
      </div>

      {/* Review Note & Controls */}
      <div className="space-y-3 pt-2 border-t border-theme/40">
        <input
          type="text"
          value={reviewNote}
          onChange={(e) => setReviewNote(e.target.value)}
          placeholder="Admin review note / rejection feedback..."
          className="w-full px-4 py-2 rounded-2xl bg-theme-surface border border-theme/60 text-xs font-semibold text-theme-heading focus:outline-none"
        />

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={() => handleReview('REJECT')}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-40"
          >
            {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
            <span>Reject Application</span>
          </button>

          <button
            onClick={() => handleReview('APPROVE')}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-md transition-all flex items-center gap-1.5 disabled:opacity-40"
          >
            {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            <span>Approve & Grant Author Access</span>
          </button>
        </div>
      </div>
    </div>
  );
}
