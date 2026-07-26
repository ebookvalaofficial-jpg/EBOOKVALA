'use client';

import React, { useState } from 'react';
import { Send, RefreshCw } from 'lucide-react';

interface ReplyFormProps {
  discussionId: string;
  parentReplyId?: string | null;
  onReplyAdded?: () => void;
  placeholder?: string;
}

export default function ReplyForm({
  discussionId,
  parentReplyId = null,
  onReplyAdded,
  placeholder = 'Write a reply...',
}: ReplyFormProps) {
  const [body, setBody] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/community/discussions/${discussionId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          body,
          parentReplyId: parentReplyId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to post reply');
        return;
      }

      setBody('');
      if (onReplyAdded) onReplyAdded();
    } catch (err: any) {
      setError('Network error posting reply');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 font-inter">
      {error && (
        <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold">
          {error}
        </div>
      )}

      <div className="relative">
        <textarea
          rows={3}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 rounded-2xl bg-theme-surface border border-theme/60 text-xs font-semibold text-theme-heading focus:outline-none focus:border-amber-500 pr-24"
        />

        <button
          type="submit"
          disabled={isLoading || !body.trim()}
          className="absolute bottom-3 right-3 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white text-xs font-bold uppercase shadow-md disabled:opacity-40 transition-all flex items-center gap-1.5"
        >
          {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          <span>Reply</span>
        </button>
      </div>
    </form>
  );
}
