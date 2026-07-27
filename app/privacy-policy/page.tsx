import React from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { ShieldCheck, Lock, Eye, FileText } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy — EbookVala',
  description: 'EbookVala Privacy Policy explaining how we collect, protect, and handle user data in compliance with IT Act 2000 and Digital Personal Data Protection (DPDP) Act.',
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-theme-bg text-theme-body font-inter">
      <Navbar />

      <div className="pt-32 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-primary-blue bg-blue-500/10 px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Data Governance
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-theme-heading font-montserrat mt-4 mb-4">
            Privacy Policy
          </h1>
          <p className="text-sm sm:text-base text-theme-muted">
            Last Updated: July 26, 2026 • Compliant with Information Technology Act, 2000 & Digital Personal Data Protection Act (DPDP), 2023.
          </p>
        </div>

        <div className="p-8 sm:p-12 rounded-3xl bg-theme-card border border-theme glass-card space-y-8 text-sm sm:text-base leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-theme-heading font-montserrat flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary-blue" /> 1. Introduction & Scope
            </h2>
            <p>
              Welcome to <strong>EbookVala</strong> (&quot;Platform&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). EbookVala is a next-generation eBook marketplace and AI reading platform operated in India. We prioritize the privacy and security of our readers, authors, and visitors.
            </p>
            <p>
              This Privacy Policy explains how personal information is collected, processed, disclosed, and safeguarded when you visit our website, register an account, purchase digital eBooks, or interact with our AI reading tools.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-theme-heading font-montserrat flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary-blue" /> 2. Information We Collect
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-theme-body">
              <li><strong>Account & Credentials:</strong> Full name, email address, encrypted password, profile picture, and onboarding role preferences.</li>
              <li><strong>Payment Information:</strong> Transaction details, Razorpay Order IDs, invoice billing addresses. We do NOT store credit/debit card numbers or UPI PINs on our servers.</li>
              <li><strong>Reading Activity & Telemetry:</strong> Reading progress percentage, highlights, bookmarks, reading streaks, AI Chat prompts, and completed quizzes.</li>
              <li><strong>Technical Data:</strong> IP address, device type, browser specifications, operating system, and log statistics.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-theme-heading font-montserrat flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-blue" /> 3. How We Use Your Data
            </h2>
            <p>We process your personal information for legitimate business purposes, including:</p>
            <ul className="list-disc pl-6 space-y-2 text-theme-body">
              <li>Providing instant access to digital eBook purchases and cloud reader synchronization across devices.</li>
              <li>Processing Razorpay payment checkouts, generating tax invoices, and fulfilling author royalty settlements.</li>
              <li>Powering interactive AI features such as AI Chat with Book, instant chapter summaries, and voice narration.</li>
              <li>Protecting platform integrity, detecting fraud, and enforcing terms of service.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-theme-heading font-montserrat">
              4. Data Sharing & Third-Party Services
            </h2>
            <p>
              We never sell your personal data to advertising broker networks. We share limited necessary data only with trusted infrastructure partners:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-theme-body">
              <li><strong>Razorpay:</strong> Payment processing gateway for domestic and international transactions.</li>
              <li><strong>Neon PostgreSQL & Cloud Providers:</strong> Secure database hosting with 256-bit TLS encryption in transit and at rest.</li>
              <li><strong>LLM API Providers:</strong> Anonymized text snippets processed strictly for generating AI summaries and flashcards without retaining prompt history for model training.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-theme-heading font-montserrat">
              5. Your Rights & Data Subject Access
            </h2>
            <p>
              Under the DPDP Act 2023, Indian residents have the right to inspect, update, or request complete deletion of their account data (&quot;Right to be Forgotten&quot;). You may request data export or account closure by contacting our Data Protection Officer at <a href="mailto:ebookvala.official@gmail.com" className="text-primary-blue underline">ebookvala.official@gmail.com</a>.
            </p>
          </section>

          <section className="space-y-3 border-t border-theme pt-6">
            <h2 className="text-lg font-bold text-theme-heading font-montserrat">
              6. Grievance Officer Contact
            </h2>
            <p className="text-xs text-theme-muted">
              In accordance with Information Technology Act 2000 and rules made thereunder:
              <br />
              <strong>Grievance Officer:</strong> Prince Gajera
              <br />
              <strong>Email:</strong> ebookvala.official@gmail.com
              <br />
              <strong>Address:</strong> EbookVala Tech HQ, Gujarat, India.
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
