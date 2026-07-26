'use client';

import React, { useState } from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { ShieldAlert, Send, CheckCircle2, AlertCircle } from 'lucide-react';

export default function DmcaPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    copyrightedWork: '',
    infringingUrl: '',
    statement: '',
    signature: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/dmca', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsSuccess(true);
        setFormData({
          name: '',
          email: '',
          copyrightedWork: '',
          infringingUrl: '',
          statement: '',
          signature: '',
        });
      } else {
        const data = await res.json();
        setErrorMessage(data.error || 'Failed to submit DMCA request.');
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

      <div className="pt-32 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-red-500 bg-red-500/10 px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-red-500" /> Intellectual Property Notice
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-theme-heading font-montserrat mt-4 mb-4">
            DMCA Copyright Takedown Request
          </h1>
          <p className="text-sm sm:text-base text-theme-muted max-w-2xl mx-auto">
            If you believe your copyrighted work has been improperly hosted on EbookVala, submit an official takedown request below for immediate investigation.
          </p>
        </div>

        <div className="p-8 sm:p-12 rounded-3xl bg-theme-card border border-theme glass-card">
          {isSuccess ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-theme-heading font-montserrat">
                DMCA Notice Submitted Successfully
              </h2>
              <p className="text-sm text-theme-muted max-w-md mx-auto">
                Thank you. Your takedown request has been recorded and logged. Our Legal Compliance team will review your submission within 24 business hours.
              </p>
              <button
                onClick={() => setIsSuccess(false)}
                className="mt-4 px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors"
              >
                Submit Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMessage && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-theme-heading mb-1">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-theme text-xs text-theme-heading focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-theme-heading mb-1">
                    Contact Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="copyright@yourcompany.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-theme text-xs text-theme-heading focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-theme-heading mb-1">
                  Description of Copyrighted Work *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Provide details of the book title, ISBN, or original copyrighted material you own..."
                  value={formData.copyrightedWork}
                  onChange={(e) => setFormData({ ...formData, copyrightedWork: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-theme text-xs text-theme-heading focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-theme-heading mb-1">
                  URL of Infringing Content on EbookVala *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://ebookvala.com/books/sample-book-slug"
                  value={formData.infringingUrl}
                  onChange={(e) => setFormData({ ...formData, infringingUrl: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-theme text-xs text-theme-heading focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-theme-heading mb-1">
                  Good-Faith Statement *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="I hereby state that I have a good-faith belief that use of the material in the manner complained of is not authorized by the copyright owner..."
                  value={formData.statement}
                  onChange={(e) => setFormData({ ...formData, statement: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-theme text-xs text-theme-heading focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-theme-heading mb-1">
                  Electronic Signature (Type Full Legal Name) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={formData.signature}
                  onChange={(e) => setFormData({ ...formData, signature: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-theme text-xs text-theme-heading focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium font-mono"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-xl text-sm font-bold text-white brand-gradient-bg shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 flex items-center justify-center gap-2 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Submitting Takedown Request...' : 'Submit Official DMCA Request'}</span>
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
