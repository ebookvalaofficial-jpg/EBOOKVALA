'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { User as UserIcon, Check, AlertCircle, Sparkles } from 'lucide-react';

interface ProfileFormProps {
  user: {
    id: string;
    name?: string | null;
    email: string;
    image?: string | null;
    bio?: string | null;
  };
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const [name, setName] = useState(user.name || '');
  const [bio, setBio] = useState(user.bio || '');
  const [image, setImage] = useState(user.image || '');
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMsg(null);

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, bio, image }),
      });

      if (res.ok) {
        setMsg({ type: 'success', text: 'Profile updated successfully!' });
        setTimeout(() => setMsg(null), 3000);
      } else {
        const data = await res.json();
        setMsg({ type: 'error', text: data.error || 'Failed to update profile' });
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: 'Network error occurred' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 rounded-3xl bg-theme-card border border-theme glass-card space-y-6 text-theme-text">
      <div className="flex items-center gap-2 pb-4 border-b border-theme/60">
        <UserIcon className="w-5 h-5 text-primary-blue" />
        <h3 className="text-base font-bold text-theme-heading font-montserrat">Public Profile</h3>
      </div>

      {msg && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
            msg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
          }`}
        >
          {msg.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Avatar Preview & URL */}
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-blue-600 text-white font-black flex items-center justify-center text-xl shadow-md shrink-0">
          {image ? (
            <Image src={image} alt={name || 'Avatar'} fill unoptimized className="object-cover" />
          ) : (
            name?.[0]?.toUpperCase() || 'U'
          )}
        </div>

        <div className="flex-1 space-y-1">
          <label className="text-xs font-bold text-theme-heading block">Avatar Image URL</label>
          <input
            type="text"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="https://example.com/avatar.jpg or /team/prince-gajera.jpg"
            className="w-full px-3.5 py-2 rounded-xl bg-theme-surface border border-theme text-xs text-theme-heading font-medium focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Display Name */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-theme-heading block">Full Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-3.5 py-2.5 rounded-xl bg-theme-surface border border-theme text-xs font-semibold text-theme-heading focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Email (Read Only) */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-theme-heading block">Email Address (Primary)</label>
        <input
          type="email"
          value={user.email}
          disabled
          className="w-full px-3.5 py-2.5 rounded-xl bg-theme-surface/50 border border-theme/40 text-xs font-semibold text-theme-muted cursor-not-allowed"
        />
      </div>

      {/* Bio */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-theme-heading block">Personal Bio / Reader Tagline</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          placeholder="Passionate tech reader, avid learner, and non-fiction explorer..."
          className="w-full px-3.5 py-2.5 rounded-xl bg-theme-surface border border-theme text-xs font-medium text-theme-heading focus:outline-none focus:border-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className="px-6 py-2.5 rounded-xl text-xs font-bold text-white brand-gradient-bg shadow-md hover:shadow-blue-500/25 transition-all"
      >
        {isSaving ? 'Saving Changes...' : 'Save Profile'}
      </button>
    </form>
  );
}
