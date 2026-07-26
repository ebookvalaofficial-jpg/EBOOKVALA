'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { AlertTriangle, Send, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ReportAProblemPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    issueType: 'Technical Bug',
    description: '',
    screenshotUrl: '',
    browserInfo: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Auto-capture browser / OS info
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const info = `${navigator.userAgent} | Screen: ${window.innerWidth}x${window.innerHeight}`;
      setFormData((prev) => ({ ...prev, browserInfo: info }));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/report-problem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsSuccess(true);
        setFormData({
          name: '',
          email: '',
          issueType: 'Technical Bug',
          description: '',
          screenshotUrl: '',
          browserInfo: typeof window !== 'undefined' ? navigator.userAgent : '',
        });
      } else {
        const data = await res.json();
        setErrorMessage(data.error || 'Failed to submit problem report.');
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-theme-bg text-theme-body font-inter">
      <Navbar />

      <div className="pt-32 pb-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-500 bg-amber-500/10 px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Technical Support
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-theme-heading font-montserrat mt-4 mb-4">
            Report a Technical Problem
          </h1>
          <p className="text-sm sm:text-base text-theme-muted max-w-lg mx-auto">
            Encountered a bug, reading progress sync issue, or payment glitch? Describe what happened and our engineering team will investigate.
          </p>
        </div>

        <div className="p-8 sm:p-10 rounded-3xl bg-theme-card border border-theme glass-card">
          {isSuccess ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-theme-heading font-montserrat">
                Problem Report Received
              </h2>
              <p className="text-xs text-theme-muted max-w-sm mx-auto">
                Thank you for helping us improve EbookVala! Our team has logged your issue and device information for review.
              </p>
              <button
                onClick={() => setIsSuccess(false)}
                className="mt-2 px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors"
              >
                Submit Another Report
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-theme-heading mb-1">
                    Your Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-theme text-xs text-theme-heading focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-theme-heading mb-1">
                    Email Address (For Updates)
                  </label>
                  <input
                    type="email"
                    placeholder="rahul@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-theme text-xs text-theme-heading focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-theme-heading mb-1">
                  Issue Category *
                </label>
                <select
                  value={formData.issueType}
                  onChange={(e) => setFormData({ ...formData, issueType: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-theme text-xs text-theme-heading focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="Technical Bug">Technical Bug / UI Glitch</option>
                  <option value="Payment / Checkout">Payment / Checkout Issue</option>
                  <option value="eBook Reader / Sync">eBook Reader / Reading Progress Sync</option>
                  <option value="AI Feature Error">AI Feature / Chat / Summary Error</option>
                  <option value="Author Dashboard">Author Dashboard / Manuscript Upload</option>
                  <option value="Other">Other Issue</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-theme-heading mb-1">
                  Detailed Description *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Explain what happened, what page you were on, and any error messages displayed..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-theme text-xs text-theme-heading focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-theme-heading mb-1">
                  Optional Screenshot Link (Imgur / Cloud)
                </label>
                <input
                  type="url"
                  placeholder="https://imgur.com/your-screenshot.png"
                  value={formData.screenshotUrl}
                  onChange={(e) => setFormData({ ...formData, screenshotUrl: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-theme text-xs text-theme-heading focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl text-xs font-bold text-white brand-gradient-bg shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 flex items-center justify-center gap-2 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Sending Report...' : 'Submit Problem Report'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
