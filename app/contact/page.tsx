'use client';

import React, { useState } from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { motion } from 'framer-motion';
import { Mail, MapPin, Clock, Send, CheckCircle2, MessageSquare, Sparkles, HelpCircle } from 'lucide-react';

const subjects = [
  'General Inquiry',
  'Customer Support',
  'Partnership & Business',
  'Author Application',
  'Press & Media',
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: subjects[0],
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsSuccess(true);
        setFormData({ name: '', email: '', subject: subjects[0], message: '' });
      } else {
        setErrorMessage(data.error || 'Failed to submit form. Please check your inputs.');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-theme-bg text-theme-body flex flex-col justify-between pt-28 pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 space-y-16">
        
        {/* HERO SECTION */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-bold uppercase tracking-widest text-primary-blue bg-blue-500/10 px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5 border border-blue-500/20"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> We &apos;d Love to Hear From You
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl font-black text-theme-heading font-montserrat tracking-tight"
          >
            Get in Touch
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-theme-body max-w-xl mx-auto"
          >
            Have a question about our eBooks, AI reader tools, subscriptions, or partnership opportunities? Send us a message and our team will get back to you quickly.
          </motion.p>
        </div>

        {/* MAIN LAYOUT: FORM + CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* CONTACT FORM (8 COLUMNS) */}
          <div className="lg:col-span-7 bg-theme-card border border-theme glass-card p-8 sm:p-10 rounded-3xl shadow-xl">
            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-theme-heading font-montserrat">
                  Message Received!
                </h3>
                <p className="text-sm text-theme-body max-w-md mx-auto leading-relaxed">
                  Thank you for reaching out. We have logged your request and our support team will respond to your email within 24 hours.
                </p>
                <button
                  onClick={() => setIsSuccess(false)}
                  className="mt-4 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md"
                >
                  Send Another Message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-theme/60">
                  <MessageSquare className="w-5 h-5 text-primary-blue" />
                  <h2 className="text-lg font-extrabold text-theme-heading font-montserrat">
                    Send Us a Message
                  </h2>
                </div>

                {errorMessage && (
                  <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold">
                    {errorMessage}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-theme-muted block">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Prince Gajera"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-theme-surface border border-theme text-sm text-theme-heading placeholder:text-theme-muted focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-theme-muted block">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="prince@ebookvala.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-theme-surface border border-theme text-sm text-theme-heading placeholder:text-theme-muted focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-theme-muted block">
                    Topic / Subject
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-theme-surface border border-theme text-sm font-medium text-theme-heading focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  >
                    {subjects.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-theme-muted block">
                    Your Message
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Tell us how we can help you..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-theme-surface border border-theme text-sm text-theme-heading placeholder:text-theme-muted focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Sending Message...' : 'Send Message'}</span>
                </button>
              </form>
            )}
          </div>

          {/* CONTACT INFO CARDS (5 COLUMNS) */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="p-6 rounded-3xl bg-theme-card border border-theme glass-card shadow-lg flex items-start gap-4 hover:border-blue-500/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-primary-blue flex items-center justify-center shrink-0 border border-blue-500/20">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-theme-heading font-montserrat">
                  Email Support
                </h3>
                <p className="text-xs text-theme-muted mt-1 leading-relaxed">
                  Send us an email anytime for account assistance or general queries.
                </p>
                <a href="mailto:support@ebookvala.com" className="inline-block mt-2 text-xs font-bold text-primary-blue hover:underline">
                  support@ebookvala.com
                </a>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-theme-card border border-theme glass-card shadow-lg flex items-start gap-4 hover:border-blue-500/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-theme-heading font-montserrat">
                  Office Location
                </h3>
                <p className="text-xs text-theme-muted mt-1 leading-relaxed">
                  EbookVala Headquarters
                </p>
                <span className="inline-block mt-2 text-xs font-semibold text-theme-heading">
                  Ahmedabad, Gujarat, India
                </span>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-theme-card border border-theme glass-card shadow-lg flex items-start gap-4 hover:border-blue-500/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-theme-heading font-montserrat">
                  Response Time
                </h3>
                <p className="text-xs text-theme-muted mt-1 leading-relaxed">
                  We reply to all tickets and inquiries within 24 hours.
                </p>
                <span className="inline-block mt-2 text-xs font-bold text-amber-400">
                  Mon – Sat (9:00 AM – 7:00 PM IST)
                </span>
              </div>
            </div>

            {/* PREFER EMAIL DIRECT NOTE */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-900/30 via-indigo-900/20 to-theme-card border border-blue-500/30 glass-card text-center space-y-3">
              <HelpCircle className="w-8 h-8 text-primary-blue mx-auto" />
              <h4 className="text-sm font-bold text-theme-heading font-montserrat">
                Prefer Direct Email?
              </h4>
              <p className="text-xs text-theme-muted">
                You can write directly to our core team at <a href="mailto:support@ebookvala.com" className="text-primary-blue font-bold hover:underline">support@ebookvala.com</a>.
              </p>
            </div>

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
