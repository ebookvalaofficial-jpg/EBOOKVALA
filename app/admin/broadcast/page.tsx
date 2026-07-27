'use client';

import React, { useEffect, useState } from 'react';
import { Mail, Send, Users, ShieldAlert, CheckCircle, Clock, Loader2, Sparkles, Filter } from 'lucide-react';

interface BroadcastLog {
  id: string;
  subject: string;
  body: string;
  segment: string;
  recipientCount: number;
  sentAt: string;
  sentByAdmin: { name: string | null; email: string };
}

export default function AdminBroadcastPage() {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [segment, setSegment] = useState('ALL');
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [broadcastLogs, setBroadcastLogs] = useState<BroadcastLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);

  const fetchLogs = async () => {
    try {
      setIsLoadingLogs(true);
      const res = await fetch('/api/admin/broadcast');
      if (res.ok) {
        const data = await res.json();
        setBroadcastLogs(data.broadcasts || []);
      }
    } catch (err) {
      console.error('Fetch broadcast logs error:', err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) return;

    if (!confirm(`Are you sure you want to send this broadcast email to segment "${segment}"?`)) {
      return;
    }

    try {
      setIsSending(true);
      setMessage(null);
      const res = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, body, segment }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: data.message });
        setSubject('');
        setBody('');
        fetchLogs();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to send broadcast.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error sending broadcast.' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-8 font-inter text-theme-text">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 border border-blue-500/20 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[11px] font-black uppercase tracking-wider text-blue-300 font-montserrat flex items-center gap-1.5">
            <Mail className="w-4 h-4" /> Targeted Platform Communication
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-montserrat">
            Admin Email Broadcast Center
          </h1>
          <p className="text-xs text-blue-200">
            Compose and broadcast email notifications to segmented platform users via Resend.
          </p>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
          }`}
        >
          {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Composer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Email Composer Form */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-theme-card border border-theme glass-card space-y-6 shadow-sm">
          <h2 className="text-base font-bold text-theme-heading font-montserrat flex items-center gap-2">
            <Send className="w-4 h-4 text-blue-500" /> Compose Broadcast Email
          </h2>

          <form onSubmit={handleSendBroadcast} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-theme-heading uppercase tracking-wider mb-2">
                Target User Segment
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'ALL', label: 'All Users' },
                  { id: 'FREE', label: 'Free Plan' },
                  { id: 'PLUS', label: 'Plus Members' },
                  { id: 'AUTHORS', label: 'Authors Only' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSegment(s.id)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                      segment === s.id
                        ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                        : 'bg-theme-surface text-theme-muted hover:text-theme-heading border-theme'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-theme-heading uppercase tracking-wider mb-1.5">
                Email Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. 🔥 Flash Sale: 50% Off Top Programming eBooks This Weekend!"
                className="w-full px-4 py-3 bg-theme-surface border border-theme rounded-xl text-sm text-theme-heading focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-theme-heading uppercase tracking-wider mb-1.5">
                Message Body
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={8}
                placeholder="Write your email body message here..."
                className="w-full px-4 py-3 bg-theme-surface border border-theme rounded-xl text-sm text-theme-heading focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
            >
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>{isSending ? 'Sending Broadcast...' : `Send Broadcast Email (${segment})`}</span>
            </button>
          </form>
        </div>

        {/* Broadcast History Table */}
        <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-theme-card border border-theme glass-card space-y-4 shadow-sm">
          <h2 className="text-base font-bold text-theme-heading font-montserrat flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-500" /> Broadcast History Log
          </h2>

          {isLoadingLogs ? (
            <div className="py-12 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : broadcastLogs.length === 0 ? (
            <p className="text-xs text-theme-muted py-8 text-center">No broadcasts sent yet.</p>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {broadcastLogs.map((log) => (
                <div key={log.id} className="p-4 rounded-2xl bg-theme-surface/60 border border-theme/60 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono text-[10px] font-black border border-blue-500/20">
                      {log.segment}
                    </span>
                    <span className="text-[10px] text-theme-muted font-medium">
                      {new Date(log.sentAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-theme-heading text-sm line-clamp-1">{log.subject}</h3>
                  <p className="text-[11px] text-theme-muted line-clamp-2">{log.body}</p>

                  <div className="flex items-center justify-between text-[10px] text-theme-muted pt-1 border-t border-theme/40">
                    <span>Sent by: {log.sentByAdmin?.name || 'Admin'}</span>
                    <span className="font-bold text-emerald-400">{log.recipientCount} Recipients</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
