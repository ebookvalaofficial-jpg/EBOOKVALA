import React from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import Image from 'next/image';
import { Download, Mail, Image as ImageIcon, Sparkles } from 'lucide-react';

export const metadata = {
  title: 'Press Kit & Media Resources — EbookVala',
  description: 'Download official EbookVala logos, brand assets, color guidelines, company boilerplate description, and press contacts.',
};

export default function PressPage() {
  return (
    <main className="min-h-screen bg-theme-bg text-theme-body font-inter">
      <Navbar />

      <div className="pt-32 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-primary-blue bg-blue-500/10 px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-primary-blue" /> Media & Brand Assets
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-theme-heading font-montserrat mt-4 mb-4">
            EbookVala Press Kit
          </h1>
          <p className="text-sm sm:text-base text-theme-muted max-w-xl mx-auto leading-relaxed">
            Official company overview, downloadable logos, brand colors, and media contact information for journalists and creators.
          </p>
        </div>

        <div className="space-y-8">
          {/* Company Boilerplate */}
          <div className="p-8 rounded-3xl bg-theme-card border border-theme glass-card space-y-4">
            <h2 className="text-xl font-bold text-theme-heading font-montserrat flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent-gold" /> Company Overview
            </h2>
            <p className="text-sm text-theme-body leading-relaxed">
              <strong>EbookVala</strong> is India&apos;s premier next-generation eBook marketplace and AI reading platform. Founded by Prince Gajera and Bhanderi Prince, EbookVala empowers over 50,000+ readers across India and UAE with instant access to thousands of curated digital books, real-time AI Chat with Book capabilities, instant chapter summaries, and multi-device sync.
            </p>
          </div>

          {/* Logo Downloads */}
          <div className="p-8 rounded-3xl bg-theme-card border border-theme glass-card space-y-6">
            <h2 className="text-xl font-bold text-theme-heading font-montserrat">
              Official Logo Assets
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-between space-y-4 text-center">
                <div className="relative w-20 h-20">
                  <Image src="/logo.png" alt="Primary Logo" fill sizes="80px" className="object-contain" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">EbookVala Primary Emblem (PNG)</h4>
                  <p className="text-[11px] text-slate-400">Transparent PNG • High Resolution (800x800)</p>
                </div>
                <a
                  href="/logo.png"
                  download="EbookVala-Logo.png"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-md"
                >
                  <Download className="w-4 h-4" /> Download PNG
                </a>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-between space-y-4 text-center">
                <div className="relative w-20 h-20">
                  <Image src="/icon.png" alt="App Icon" fill sizes="80px" className="object-contain" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">EbookVala App Mark (PNG)</h4>
                  <p className="text-[11px] text-slate-400">Square Icon • PWA Mobile Mark</p>
                </div>
                <a
                  href="/icon.png"
                  download="EbookVala-Icon.png"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-md"
                >
                  <Download className="w-4 h-4" /> Download Icon
                </a>
              </div>
            </div>
          </div>

          {/* Brand Palette */}
          <div className="p-8 rounded-3xl bg-theme-card border border-theme glass-card space-y-4">
            <h2 className="text-xl font-bold text-theme-heading font-montserrat">
              Brand Color Palette
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="p-4 rounded-2xl bg-blue-600 text-white space-y-1">
                <p className="text-xs font-bold">Electric Blue</p>
                <p className="text-[11px] font-mono opacity-90">#2563EB</p>
              </div>
              <div className="p-4 rounded-2xl bg-amber-400 text-slate-950 space-y-1">
                <p className="text-xs font-bold">Amber Gold</p>
                <p className="text-[11px] font-mono opacity-90">#F59E0B</p>
              </div>
              <div className="p-4 rounded-2xl bg-purple-600 text-white space-y-1">
                <p className="text-xs font-bold">Deep Purple</p>
                <p className="text-[11px] font-mono opacity-90">#9333EA</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 text-white border border-slate-800 space-y-1">
                <p className="text-xs font-bold">Midnight Dark</p>
                <p className="text-[11px] font-mono opacity-90">#020617</p>
              </div>
            </div>
          </div>

          {/* Media Contact */}
          <div className="p-8 rounded-3xl bg-blue-500/10 border border-blue-500/20 text-center space-y-2">
            <h3 className="text-base font-bold text-theme-heading font-montserrat">Media Inquiries</h3>
            <p className="text-xs sm:text-sm text-theme-muted">
              For press inquiries, founder interviews, or feature commentary, please email <a href="mailto:ebookvala.official@gmail.com" className="text-primary-blue font-bold underline">ebookvala.official@gmail.com</a>.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
