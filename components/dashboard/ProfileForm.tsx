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
    readingInterests?: string | string[] | null;
    languagePreference?: string | null;
    showOnLeaderboard?: boolean;
  };
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const [name, setName] = useState(user.name || '');
  const [bio, setBio] = useState(user.bio || '');
  const [image, setImage] = useState(user.image || '');

  const parseInterests = (): string[] => {
    if (Array.isArray(user.readingInterests)) return user.readingInterests;
    if (typeof user.readingInterests === 'string') {
      try {
        return JSON.parse(user.readingInterests);
      } catch {
        return user.readingInterests.split(',').map(s => s.trim());
      }
    }
    return ['Fiction', 'Business & Finance'];
  };

  const [readingInterests, setReadingInterests] = useState<string[]>(parseInterests());
  const [languagePreference, setLanguagePreference] = useState(user.languagePreference || 'English');
  const [showOnLeaderboard, setShowOnLeaderboard] = useState(user.showOnLeaderboard ?? true);

  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const categories = ['Fiction', 'Non-Fiction', 'Self Help', 'Biography', 'Comic', 'Business & Finance'];

  const toggleInterest = (category: string) => {
    if (readingInterests.includes(category)) {
      setReadingInterests(readingInterests.filter(c => c !== category));
    } else {
      setReadingInterests([...readingInterests, category]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMsg(null);

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          bio,
          image,
          readingInterests,
          languagePreference,
          showOnLeaderboard,
        }),
      });

      if (res.ok) {
        setMsg({ type: 'success', text: 'Profile & preferences updated successfully!' });
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
        <h3 className="text-base font-bold text-theme-heading font-montserrat">Public Profile & Reading Preferences</h3>
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
            placeholder="https://example.com/avatar.jpg"
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

      {/* Reading Interests Multi-Select */}
      <div className="space-y-2 pt-2 border-t border-theme/60">
        <label className="text-xs font-bold text-theme-heading block">Reading Interests</label>
        <p className="text-[11px] text-theme-muted">Select your favorite eBook genres for personalized recommendations.</p>
        <div className="flex flex-wrap gap-2 pt-1">
          {categories.map((cat) => {
            const isSelected = readingInterests.includes(cat);
            return (
              <button
                key={cat}
                type="button"
                onClick={() => toggleInterest(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  isSelected
                    ? 'bg-blue-500/15 border-blue-500 text-primary-blue'
                    : 'bg-theme-surface border-theme text-theme-muted hover:border-slate-600'
                }`}
              >
                {cat} {isSelected && '✓'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Language Preference */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-theme-heading block">Preferred Reading Language</label>
        <select
          value={languagePreference}
          onChange={(e) => setLanguagePreference(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl bg-theme-surface border border-theme text-xs font-semibold text-theme-heading focus:outline-none focus:border-blue-500"
        >
          <option value="English">English</option>
          <option value="Hindi">Hindi (हिंदी)</option>
          <option value="Gujarati">Gujarati (ગુજરાતી)</option>
          <option value="Marathi">Marathi (मराठी)</option>
          <option value="Spanish">Spanish (Español)</option>
          <option value="French">French (Français)</option>
        </select>
      </div>

      {/* Leaderboard Privacy Toggle */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-theme-surface border border-theme">
        <div>
          <span className="text-xs font-bold text-theme-heading block">Show on Public Leaderboard</span>
          <p className="text-[11px] text-theme-muted">
            Display your rank, level, and XP points on the community leaderboard. Your email is never shown.
          </p>
        </div>
        <input
          type="checkbox"
          checked={showOnLeaderboard}
          onChange={(e) => setShowOnLeaderboard(e.target.checked)}
          className="w-5 h-5 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
        />
      </div>

      {/* Connected Devices Section */}
      <div className="p-4 rounded-2xl bg-theme-surface border border-theme space-y-2">
        <span className="text-xs font-bold text-theme-heading block">Connected Devices</span>
        <div className="space-y-1 text-xs text-theme-muted">
          <div className="flex items-center justify-between py-1 border-b border-theme/40">
            <span>Chrome on Windows (Current Session)</span>
            <span className="text-emerald-400 font-bold">Active Now</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span>Mobile Web (Android/iOS)</span>
            <span className="text-theme-muted">Synced</span>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className="px-6 py-2.5 rounded-xl text-xs font-bold text-white brand-gradient-bg shadow-md hover:shadow-blue-500/25 transition-all"
      >
        {isSaving ? 'Saving Changes...' : 'Save Profile & Preferences'}
      </button>
    </form>
  );
}
