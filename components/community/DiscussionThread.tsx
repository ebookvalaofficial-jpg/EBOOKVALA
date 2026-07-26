'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { User, MessageSquare, Flag, Lock, CornerDownRight } from 'lucide-react';
import ReactionBar from './ReactionBar';
import ReplyForm from './ReplyForm';
import ReportDialog from './ReportDialog';

interface ReplyItem {
  id: string;
  body: string;
  createdAt: string;
  user: {
    id: string;
    name?: string | null;
    image?: string | null;
    isAuthor?: boolean;
  };
  childReplies?: ReplyItem[];
}

interface DiscussionThreadProps {
  discussion: {
    id: string;
    title: string;
    body: string;
    isLocked: boolean;
    isPinned: boolean;
    createdAt: string;
    authorUser: {
      id: string;
      name?: string | null;
      image?: string | null;
      isAuthor?: boolean;
    };
  };
  currentUserId?: string;
  isAdmin?: boolean;
}

export default function DiscussionThread({
  discussion,
  currentUserId,
  isAdmin = false,
}: DiscussionThreadProps) {
  const [replies, setReplies] = useState<ReplyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [reportTarget, setReportTarget] = useState<{ type: 'DISCUSSION' | 'REPLY'; id: string } | null>(null);

  const fetchReplies = useCallback(async () => {
    try {
      const res = await fetch(`/api/community/discussions/${discussion.id}/replies`);
      if (res.ok) {
        const data = await res.json();
        setReplies(data.replies || []);
      }
    } catch (err) {
      console.error('Error fetching replies:', err);
    } finally {
      setIsLoading(false);
    }
  }, [discussion.id]);

  useEffect(() => {
    fetchReplies();
  }, [fetchReplies]);

  return (
    <div className="space-y-8 font-inter text-theme-text">
      {/* Discussion Main Body */}
      <div className="p-6 sm:p-8 rounded-3xl bg-theme-card border border-theme glass-card space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-theme/60 pb-4">
          <div className="flex items-center gap-3">
            <Link href={`/profile/${discussion.authorUser.id}`}>
              <div className="relative w-11 h-11 rounded-2xl overflow-hidden bg-theme-surface border border-theme/60 shrink-0">
                {discussion.authorUser.image ? (
                  <Image src={discussion.authorUser.image} alt={discussion.authorUser.name || 'Author'} fill className="object-cover" unoptimized />
                ) : (
                  <User className="w-6 h-6 text-theme-muted m-auto" />
                )}
              </div>
            </Link>

            <div>
              <Link href={`/profile/${discussion.authorUser.id}`} className="font-bold text-theme-heading text-sm hover:underline flex items-center gap-1.5">
                <span>{discussion.authorUser.name || 'Anonymous Reader'}</span>
                {discussion.authorUser.isAuthor && (
                  <span className="px-2 py-0.2 rounded-full bg-amber-500/10 text-amber-500 text-[9px] font-black uppercase">
                    Author
                  </span>
                )}
              </Link>
              <span className="text-[11px] text-theme-muted">
                Posted {new Date(discussion.createdAt).toLocaleString()}
              </span>
            </div>
          </div>

          <button
            onClick={() => setReportTarget({ type: 'DISCUSSION', id: discussion.id })}
            className="p-2 rounded-xl border border-theme/60 hover:bg-red-500/10 text-theme-muted hover:text-red-500 transition-colors"
            title="Report discussion"
          >
            <Flag className="w-4 h-4" />
          </button>
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-theme-heading font-montserrat leading-tight">
          {discussion.title}
        </h1>

        <div className="text-sm font-semibold text-theme-text leading-relaxed whitespace-pre-line bg-theme-surface/30 p-5 rounded-2xl border border-theme/40">
          {discussion.body}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <ReactionBar targetType="DISCUSSION" targetId={discussion.id} />
        </div>
      </div>

      {/* Reply Form / Locked Notice */}
      <div className="p-6 rounded-3xl bg-theme-card border border-theme glass-card space-y-4 shadow-xl">
        <h3 className="text-base font-bold text-theme-heading font-montserrat flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-amber-500" />
          <span>Join the Conversation ({replies.reduce((sum, r) => sum + 1 + (r.childReplies?.length || 0), 0)})</span>
        </h3>

        {discussion.isLocked && !isAdmin ? (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <span>This discussion thread is locked by administrators. New replies cannot be added.</span>
          </div>
        ) : (
          <ReplyForm discussionId={discussion.id} onReplyAdded={fetchReplies} />
        )}
      </div>

      {/* Replies Thread */}
      <div className="space-y-4">
        {replies.map((reply) => (
          <div key={reply.id} className="p-6 rounded-3xl bg-theme-card border border-theme glass-card space-y-4 shadow-lg">
            {/* Top Level Reply Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link href={`/profile/${reply.user.id}`}>
                  <div className="relative w-8 h-8 rounded-xl overflow-hidden bg-theme-surface border border-theme/60 shrink-0">
                    {reply.user.image ? (
                      <Image src={reply.user.image} alt={reply.user.name || 'User'} fill className="object-cover" unoptimized />
                    ) : (
                      <User className="w-4 h-4 text-theme-muted m-auto" />
                    )}
                  </div>
                </Link>

                <div className="text-xs">
                  <span className="font-bold text-theme-heading">{reply.user.name || 'Reader'}</span>
                  <span className="text-[10px] text-theme-muted ml-2">{new Date(reply.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <button
                onClick={() => setReportTarget({ type: 'REPLY', id: reply.id })}
                className="text-theme-muted hover:text-red-500 text-xs"
                title="Report reply"
              >
                <Flag className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs font-semibold text-theme-text leading-relaxed pl-2 border-l-2 border-amber-500/40">
              {reply.body}
            </p>

            <div className="flex items-center justify-between gap-4 pt-1">
              <ReactionBar targetType="REPLY" targetId={reply.id} />

              {!discussion.isLocked && (
                <button
                  onClick={() => setActiveReplyId(activeReplyId === reply.id ? null : reply.id)}
                  className="text-xs font-bold text-amber-500 hover:underline flex items-center gap-1"
                >
                  <CornerDownRight className="w-3.5 h-3.5" />
                  <span>Reply</span>
                </button>
              )}
            </div>

            {/* Nested Reply Form */}
            {activeReplyId === reply.id && (
              <div className="pl-6 pt-2">
                <ReplyForm
                  discussionId={discussion.id}
                  parentReplyId={reply.id}
                  onReplyAdded={() => {
                    setActiveReplyId(null);
                    fetchReplies();
                  }}
                  placeholder={`Replying to ${reply.user.name || 'Reader'}...`}
                />
              </div>
            )}

            {/* Child Replies (1 level deep) */}
            {reply.childReplies && reply.childReplies.length > 0 && (
              <div className="pl-6 pt-3 space-y-3 border-l-2 border-theme/40">
                {reply.childReplies.map((child) => (
                  <div key={child.id} className="p-4 rounded-2xl bg-theme-surface/40 border border-theme/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Link href={`/profile/${child.user.id}`}>
                          <div className="relative w-6 h-6 rounded-lg overflow-hidden bg-theme-surface border border-theme/60">
                            {child.user.image ? (
                              <Image src={child.user.image} alt={child.user.name || 'User'} fill className="object-cover" unoptimized />
                            ) : (
                              <User className="w-3.5 h-3.5 text-theme-muted m-auto" />
                            )}
                          </div>
                        </Link>
                        <span className="text-xs font-bold text-theme-heading">{child.user.name || 'Reader'}</span>
                      </div>
                      <span className="text-[10px] text-theme-muted">{new Date(child.createdAt).toLocaleDateString()}</span>
                    </div>

                    <p className="text-xs font-semibold text-theme-text">{child.body}</p>
                    <ReactionBar targetType="REPLY" targetId={child.id} />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Reusable Report Modal */}
      {reportTarget && (
        <ReportDialog
          targetType={reportTarget.type}
          targetId={reportTarget.id}
          isOpen={!!reportTarget}
          onClose={() => setReportTarget(null)}
        />
      )}
    </div>
  );
}
