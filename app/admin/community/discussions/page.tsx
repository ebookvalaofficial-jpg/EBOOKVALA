'use client';

import React, { useState, useEffect } from 'react';
import { Pin, Lock, Trash2, RefreshCw, MessageSquare } from 'lucide-react';

interface DiscussionAdminItem {
  id: string;
  title: string;
  isPinned: boolean;
  isLocked: boolean;
  viewCount: number;
  createdAt: string;
  authorUser: {
    name?: string | null;
    email: string;
  };
  _count?: {
    replies: number;
  };
}

export default function AdminDiscussionsPage() {
  const [discussions, setDiscussions] = useState<DiscussionAdminItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchDiscussions = async () => {
    try {
      const res = await fetch('/api/community/discussions?limit=50');
      if (res.ok) {
        const data = await res.json();
        setDiscussions(data.discussions || []);
      }
    } catch (err) {
      console.error('Error fetching admin discussions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscussions();
  }, []);

  const handleTogglePin = async (id: string, currentPinned: boolean) => {
    setActionId(id);
    try {
      await fetch(`/api/community/discussions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: !currentPinned }),
      });
      fetchDiscussions();
    } catch (err) {
      console.error('Error toggling pin:', err);
    } finally {
      setActionId(null);
    }
  };

  const handleToggleLock = async (id: string, currentLocked: boolean) => {
    setActionId(id);
    try {
      await fetch(`/api/community/discussions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isLocked: !currentLocked }),
      });
      fetchDiscussions();
    } catch (err) {
      console.error('Error toggling lock:', err);
    } finally {
      setActionId(null);
    }
  };

  const handleDeleteDiscussion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this discussion thread?')) return;

    setActionId(id);
    try {
      await fetch(`/api/community/discussions/${id}`, {
        method: 'DELETE',
      });
      fetchDiscussions();
    } catch (err) {
      console.error('Error deleting discussion:', err);
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-6 font-inter text-theme-text">
      <div>
        <h1 className="text-2xl font-bold text-theme-heading font-montserrat">Discussions Management</h1>
        <p className="text-xs text-theme-muted">Pin featured threads to the top, lock completed debates, or remove inappropriate posts.</p>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-xs text-theme-muted">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-500 mb-2" />
          Loading discussions...
        </div>
      ) : discussions.length === 0 ? (
        <div className="p-12 text-center space-y-3 rounded-3xl bg-theme-card border border-theme glass-card shadow-xl">
          <MessageSquare className="w-10 h-10 text-amber-500 mx-auto" />
          <h3 className="text-base font-bold text-theme-heading">No Discussions Found</h3>
        </div>
      ) : (
        <div className="p-6 rounded-3xl bg-theme-card border border-theme glass-card space-y-4 shadow-xl overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold">
            <thead>
              <tr className="border-b border-theme/60 text-theme-muted font-bold text-[11px] uppercase">
                <th className="pb-3">Title & Author</th>
                <th className="pb-3">Stats</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme/40">
              {discussions.map((d) => (
                <tr key={d.id}>
                  <td className="py-4 max-w-sm">
                    <div className="font-bold text-theme-heading font-montserrat truncate">{d.title}</div>
                    <div className="text-[11px] text-theme-muted">By {d.authorUser.name || 'User'} ({d.authorUser.email})</div>
                  </td>
                  <td className="py-4 text-theme-muted">
                    {d._count?.replies || 0} replies · {d.viewCount} views
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-1.5">
                      {d.isPinned && (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase">
                          Pinned
                        </span>
                      )}
                      {d.isLocked && (
                        <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[10px] font-black uppercase">
                          Locked
                        </span>
                      )}
                      {!d.isPinned && !d.isLocked && (
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-500/10 text-slate-400 text-[10px] font-black uppercase">
                          Active
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    <div className="inline-flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleTogglePin(d.id, d.isPinned)}
                        disabled={actionId === d.id}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                          d.isPinned
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 font-extrabold'
                            : 'bg-theme-surface border-theme/60 text-theme-muted hover:text-theme-heading'
                        }`}
                      >
                        <Pin className="w-3.5 h-3.5 inline mr-1" />
                        {d.isPinned ? 'Unpin' : 'Pin'}
                      </button>

                      <button
                        onClick={() => handleToggleLock(d.id, d.isLocked)}
                        disabled={actionId === d.id}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                          d.isLocked
                            ? 'bg-red-500/10 border-red-500/30 text-red-500 font-extrabold'
                            : 'bg-theme-surface border-theme/60 text-theme-muted hover:text-theme-heading'
                        }`}
                      >
                        <Lock className="w-3.5 h-3.5 inline mr-1" />
                        {d.isLocked ? 'Unlock' : 'Lock'}
                      </button>

                      <button
                        onClick={() => handleDeleteDiscussion(d.id)}
                        disabled={actionId === d.id}
                        className="p-1.5 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                        title="Delete discussion"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
