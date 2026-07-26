'use client';

import React, { useState } from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { Star, Send, CheckCircle2, MessageSquarePlus } from 'lucide-react';

export default function FeedbackPage() {
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, rating, comments }),
      });

      if (res.ok) {
        setIsSuccess(true);
        setComments('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-theme-bg text-theme-body font-inter">
      <Navbar />

      <div className="pt-32 pb-20 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-purple-500 bg-purple-500/10 px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5">
            <MessageSquarePlus className="w-3.5 h-3.5 text-purple-500" /> Community Voice
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-theme-heading font-montserrat mt-4 mb-4">
            Share Your Feedback
          </h1>
          <p className="text-sm sm:text-base text-theme-muted max-w-lg mx-auto">
            How is your experience reading on EbookVala? Share what you love or what features you want us to build next!
          </p>
        </div>

        <div className="p-8 sm:p-10 rounded-3xl bg-theme-card border border-theme glass-card">
          {isSuccess ? (
            <div className="space-y-4 py-8">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-theme-heading font-montserrat">
                Thank You for Your Feedback! ❤️
              </h2>
              <p className="text-xs text-theme-muted">
                Your thoughts directly shape our product roadmap and future reading tools.
              </p>
              <button
                onClick={() => setIsSuccess(false)}
                className="mt-2 px-5 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-colors"
              >
                Submit More Feedback
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 text-left">
              <div>
                <label className="block text-xs font-bold text-theme-heading mb-2 text-center">
                  Overall Rating
                </label>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1.5 focus:outline-none transition-transform hover:scale-125"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= rating
                            ? 'text-amber-400 fill-amber-400 drop-shadow-md'
                            : 'text-slate-700'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-theme-heading mb-1">
                    Your Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Priya Patel"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-theme text-xs text-theme-heading focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-theme-heading mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="priya@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-theme text-xs text-theme-heading focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-theme-heading mb-1">
                  Your Comments or Suggestions *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tell us what you love or how we can make reading even better..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-theme text-xs text-theme-heading focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Submitting...' : 'Submit Feedback'}</span>
              </button>
            </form>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
