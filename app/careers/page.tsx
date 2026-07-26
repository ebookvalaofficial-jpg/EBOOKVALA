import React from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { Briefcase, Sparkles, Mail, MapPin } from 'lucide-react';

export const metadata = {
  title: 'Careers — EbookVala',
  description: 'Join the EbookVala team building the next generation of AI-powered eBook reading and author publishing tools in India.',
};

export default function CareersPage() {
  const roles = [
    {
      title: 'Full-Stack Next.js & AI Engineer',
      location: 'Remote / Surat, India',
      type: 'Full-Time',
      desc: 'Build real-time vector AI search, WebReader canvas engine, and high-performance streaming interfaces.',
    },
    {
      title: 'Author Community Manager',
      location: 'Remote / Mumbai, India',
      type: 'Full-Time',
      desc: 'Empower independent authors, manage royalty payouts, and scale the EbookVala Author Partner Program.',
    },
  ];

  return (
    <main className="min-h-screen bg-theme-bg text-theme-body font-inter">
      <Navbar />

      <div className="pt-32 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-primary-blue bg-blue-500/10 px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-accent-gold" /> We Are Hiring
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-theme-heading font-montserrat mt-4 mb-4">
            Build the Future of Reading With Us
          </h1>
          <p className="text-sm sm:text-base text-theme-muted max-w-xl mx-auto leading-relaxed">
            At EbookVala, we are on a mission to democratize knowledge for 500 million learners across India and global markets through AI and instant digital publishing.
          </p>
        </div>

        <div className="space-y-6 mb-12">
          <h2 className="text-xl font-bold text-theme-heading font-montserrat flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary-blue" /> Open Positions
          </h2>

          {roles.map((role) => (
            <div key={role.title} className="p-6 rounded-3xl bg-theme-card border border-theme glass-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-theme-heading font-montserrat">{role.title}</h3>
                <div className="flex items-center gap-3 text-xs text-theme-muted mt-1 mb-2">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-blue-500" /> {role.location}</span>
                  <span>•</span>
                  <span className="font-semibold text-primary-blue">{role.type}</span>
                </div>
                <p className="text-xs sm:text-sm text-theme-body">{role.desc}</p>
              </div>

              <a
                href="mailto:careers@ebookvala.com?subject=Application for Full-Stack Next.js Engineer"
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shrink-0 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Mail className="w-4 h-4" /> Apply Now
              </a>
            </div>
          ))}
        </div>

        <div className="p-8 rounded-3xl bg-blue-500/10 border border-blue-500/20 text-center space-y-3">
          <h3 className="text-base font-bold text-theme-heading font-montserrat">Don&apos;t see your role?</h3>
          <p className="text-xs sm:text-sm text-theme-muted max-w-md mx-auto">
            We are always looking for exceptional product designers, content curators, and AI engineers. Send your CV to <a href="mailto:careers@ebookvala.com" className="text-primary-blue underline font-bold">careers@ebookvala.com</a>.
          </p>
        </div>
      </div>

      <Footer />
    </main>
  );
}
