'use client';

import React, { useEffect, useState } from 'react';
import { Target, CheckCircle2, Loader2, Sparkles, Clock, BookOpen, Calendar } from 'lucide-react';

export default function ReadingGoalsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    dailyMinutes: 30,
    dailyPages: 20,
    weeklyBooks: 1,
    monthlyBooks: 2,
    yearlyBooks: 12,
  });

  useEffect(() => {
    async function loadGoals() {
      try {
        setLoading(true);
        const res = await fetch('/api/dashboard/goals');
        if (res.ok) {
          const json = await res.json();
          if (json.goal) {
            setFormData({
              dailyMinutes: json.goal.dailyMinutes || 30,
              dailyPages: json.goal.dailyPages || 20,
              weeklyBooks: json.goal.weeklyBooks || 1,
              monthlyBooks: json.goal.monthlyBooks || 2,
              yearlyBooks: json.goal.yearlyBooks || 12,
            });
          }
        }
      } catch (err) {
        console.error('Goal load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadGoals();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: Number(value) || 0 }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch('/api/dashboard/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (res.ok) {
        setMessage(json.message);
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      console.error('Goal save error:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-theme-card border border-theme glass-card">
        <h1 className="text-2xl font-extrabold text-theme-heading font-montserrat flex items-center gap-2">
          <Target className="w-6 h-6 text-primary-blue" /> Customize Your Reading Goals
        </h1>
        <p className="text-xs text-theme-muted mt-1">
          Set daily targets for minutes and pages, and establish weekly, monthly, and annual eBook reading challenges.
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {message}
        </div>
      )}

      {loading ? (
        <div className="py-16 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-blue" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Daily Minutes */}
            <div className="p-6 rounded-3xl bg-theme-card border border-theme glass-card space-y-3">
              <label className="block text-sm font-extrabold text-theme-heading font-montserrat flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" /> Daily Reading Minutes
              </label>
              <input
                type="number"
                name="dailyMinutes"
                value={formData.dailyMinutes}
                onChange={handleChange}
                min={5}
                max={300}
                className="w-full px-4 py-3 bg-theme-surface border border-theme rounded-2xl text-base font-bold text-theme-heading font-stats focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-theme-muted">Recommended: 30 minutes daily for consistent habit building.</p>
            </div>

            {/* Daily Pages */}
            <div className="p-6 rounded-3xl bg-theme-card border border-theme glass-card space-y-3">
              <label className="block text-sm font-extrabold text-theme-heading font-montserrat flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-500" /> Daily Target Pages
              </label>
              <input
                type="number"
                name="dailyPages"
                value={formData.dailyPages}
                onChange={handleChange}
                min={1}
                max={500}
                className="w-full px-4 py-3 bg-theme-surface border border-theme rounded-2xl text-base font-bold text-theme-heading font-stats focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-theme-muted font-medium">Estimated pages per day based on average reading pace.</p>
            </div>

            {/* Weekly Books */}
            <div className="p-6 rounded-3xl bg-theme-card border border-theme glass-card space-y-3">
              <label className="block text-sm font-extrabold text-theme-heading font-montserrat flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" /> Weekly Books Goal
              </label>
              <input
                type="number"
                name="weeklyBooks"
                value={formData.weeklyBooks}
                onChange={handleChange}
                min={1}
                max={20}
                className="w-full px-4 py-3 bg-theme-surface border border-theme rounded-2xl text-base font-bold text-theme-heading font-stats focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-theme-muted">Number of eBooks to complete each week.</p>
            </div>

            {/* Monthly Books */}
            <div className="p-6 rounded-3xl bg-theme-card border border-theme glass-card space-y-3">
              <label className="block text-sm font-extrabold text-theme-heading font-montserrat flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-500" /> Monthly Books Goal
              </label>
              <input
                type="number"
                name="monthlyBooks"
                value={formData.monthlyBooks}
                onChange={handleChange}
                min={1}
                max={50}
                className="w-full px-4 py-3 bg-theme-surface border border-theme rounded-2xl text-base font-bold text-theme-heading font-stats focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-theme-muted">Target books to complete each calendar month.</p>
            </div>

            {/* Yearly Challenge Books */}
            <div className="p-6 rounded-3xl bg-theme-card border border-theme glass-card space-y-3 md:col-span-2">
              <label className="block text-sm font-extrabold text-theme-heading font-montserrat flex items-center gap-2">
                <Target className="w-4 h-4 text-rose-500" /> Annual Reading Challenge (Yearly Books)
              </label>
              <input
                type="number"
                name="yearlyBooks"
                value={formData.yearlyBooks}
                onChange={handleChange}
                min={1}
                max={365}
                className="w-full px-4 py-3 bg-theme-surface border border-theme rounded-2xl text-base font-bold text-theme-heading font-stats focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-theme-muted font-medium">
                Set your annual reading goal (e.g. 12, 24, or 52 books a year). Your progress updates live on the Overview dashboard.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3.5 rounded-2xl text-xs font-bold text-white brand-gradient-bg shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Reading Goals'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
