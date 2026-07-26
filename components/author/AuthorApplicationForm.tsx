'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Send, Globe, Share2, AlertCircle, RefreshCw } from 'lucide-react';

interface AuthorApplicationFormProps {
  initialStatus?: string;
  rejectionNote?: string | null;
}

export default function AuthorApplicationForm({
  initialStatus = 'NONE',
  rejectionNote,
}: AuthorApplicationFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    penName: '',
    bio: '',
    sampleWorkUrl: '',
    sampleWorkText: '',
    website: '',
    twitter: '',
    instagram: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/author-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          penName: formData.penName,
          bio: formData.bio,
          sampleWorkUrl: formData.sampleWorkUrl || undefined,
          sampleWorkText: formData.sampleWorkText || undefined,
          socialLinks: {
            website: formData.website || undefined,
            twitter: formData.twitter || undefined,
            instagram: formData.instagram || undefined,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to submit application');
        return;
      }

      router.refresh();
    } catch (err: any) {
      setError('Network error submitting application');
    } finally {
      setIsLoading(false);
    }
  };

  if (initialStatus === 'PENDING') {
    return (
      <div className="max-w-xl mx-auto p-8 rounded-3xl bg-theme-card border border-theme glass-card text-center space-y-4 shadow-xl">
        <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-500 w-max mx-auto border border-amber-500/20">
          <Sparkles className="w-8 h-8 animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold text-theme-heading font-montserrat">Application Under Review</h2>
        <p className="text-xs text-theme-muted leading-relaxed">
          Your author application has been submitted and is currently being evaluated by the EbookVala editorial board. You will gain full access to the Author Dashboard as soon as it is approved.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-theme-card border border-theme glass-card space-y-6 shadow-xl text-theme-text font-inter">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-theme-heading font-montserrat">Author Application Form</h2>
        <p className="text-xs text-theme-muted">Tell us about yourself and your writing experience.</p>
      </div>

      {rejectionNote && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs space-y-1">
          <strong className="flex items-center gap-1.5 font-bold">
            <AlertCircle className="w-4 h-4" /> Previous Application Rejection Note:
          </strong>
          <p className="text-theme-text">{rejectionNote}</p>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold">
          {error}
        </div>
      )}

      {/* Pen Name */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-theme-heading">Pen Name / Author Display Name *</label>
        <input
          type="text"
          required
          value={formData.penName}
          onChange={(e) => setFormData({ ...formData, penName: e.target.value })}
          placeholder="e.g. Vikram Seth"
          className="w-full px-4 py-2.5 rounded-2xl bg-theme-surface border border-theme/60 text-xs font-semibold text-theme-heading focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Author Bio */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-theme-heading">Author Bio (Min 20 characters) *</label>
        <textarea
          required
          rows={3}
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          placeholder="Share your background, genre focus, and writing journey..."
          className="w-full px-4 py-2.5 rounded-2xl bg-theme-surface border border-theme/60 text-xs font-semibold text-theme-heading focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Writing Sample URL or Text */}
      <div className="space-y-4 pt-2 border-t border-theme/40">
        <h3 className="text-sm font-bold text-theme-heading font-montserrat">Writing Sample</h3>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-theme-heading">Sample Work URL (Blog, Drive, Medium)</label>
          <input
            type="url"
            value={formData.sampleWorkUrl}
            onChange={(e) => setFormData({ ...formData, sampleWorkUrl: e.target.value })}
            placeholder="https://medium.com/@author/my-article"
            className="w-full px-4 py-2.5 rounded-2xl bg-theme-surface border border-theme/60 text-xs font-semibold text-theme-heading focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-theme-heading">Or Paste Sample Excerpt (Min 50 chars)</label>
          <textarea
            rows={4}
            value={formData.sampleWorkText}
            onChange={(e) => setFormData({ ...formData, sampleWorkText: e.target.value })}
            placeholder="Paste an excerpt or chapter sample from your manuscript..."
            className="w-full px-4 py-2.5 rounded-2xl bg-theme-surface border border-theme/60 text-xs font-semibold text-theme-heading focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Optional Social Links */}
      <div className="space-y-3 pt-2 border-t border-theme/40">
        <h3 className="text-sm font-bold text-theme-heading font-montserrat">Social Links (Optional)</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-theme-muted flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" /> Website
            </label>
            <input
              type="text"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://author.com"
              className="w-full px-3 py-2 rounded-xl bg-theme-surface border border-theme/60 text-xs text-theme-heading"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-theme-muted flex items-center gap-1">
              <Share2 className="w-3.5 h-3.5" /> Twitter / X
            </label>
            <input
              type="text"
              value={formData.twitter}
              onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
              placeholder="@author_handle"
              className="w-full px-3 py-2 rounded-xl bg-theme-surface border border-theme/60 text-xs text-theme-heading"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-theme-muted flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" /> Instagram
            </label>
            <input
              type="text"
              value={formData.instagram}
              onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
              placeholder="@author_insta"
              className="w-full px-3 py-2 rounded-xl bg-theme-surface border border-theme/60 text-xs text-theme-heading"
            />
          </div>
        </div>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-extrabold text-xs uppercase tracking-wide shadow-xl disabled:opacity-40 transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          <span>Submit Author Application</span>
        </button>
      </div>
    </form>
  );
}
