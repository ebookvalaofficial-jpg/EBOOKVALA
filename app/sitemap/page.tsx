import React from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import Link from 'next/link';
import { Map, BookOpen, User, Scale, HelpCircle } from 'lucide-react';

export const metadata = {
  title: 'HTML Sitemap — EbookVala',
  description: 'Complete directory of all pages, categories, features, and resources on EbookVala.',
};

export default function HtmlSitemapPage() {
  const sections = [
    {
      title: 'Main Marketplace',
      icon: BookOpen,
      links: [
        { name: 'Home Page', href: '/' },
        { name: 'eBooks Store', href: '/books' },
        { name: 'Browse Categories', href: '/#categories' },
        { name: 'Trending Books', href: '/#trending' },
        { name: 'Pricing Plans', href: '/#pricing' },
        { name: 'Cart', href: '/cart' },
        { name: 'Checkout', href: '/checkout' },
      ],
    },
    {
      title: 'User Account & Dashboard',
      icon: User,
      links: [
        { name: 'Sign In', href: '/login' },
        { name: 'Create Account', href: '/signup' },
        { name: 'Forgot Password', href: '/forgot-password' },
        { name: 'Reader Dashboard', href: '/dashboard' },
        { name: 'My eBook Library', href: '/dashboard/library' },
        { name: 'My Orders & Invoices', href: '/account/orders' },
        { name: 'Subscription Plan', href: '/account/subscription' },
        { name: 'Saved Wishlist', href: '/wishlist' },
      ],
    },
    {
      title: 'Author Program',
      icon: BookOpen,
      links: [
        { name: 'Become an Author', href: '/become-an-author' },
        { name: 'Apply to Publish', href: '/become-an-author/apply' },
        { name: 'Author Portal', href: '/author' },
        { name: 'Author Earnings & Payouts', href: '/author/earnings' },
      ],
    },
    {
      title: 'Support & Community',
      icon: HelpCircle,
      links: [
        { name: 'Help Center & FAQ', href: '/help' },
        { name: 'Report a Problem', href: '/report-a-problem' },
        { name: 'Give Feedback', href: '/feedback' },
        { name: 'Contact Support', href: '/contact' },
        { name: 'System Status', href: '/status' },
        { name: 'Newsletter Signup', href: '/newsletter' },
        { name: 'Careers', href: '/careers' },
        { name: 'Press Kit', href: '/press' },
      ],
    },
    {
      title: 'Legal & Policies',
      icon: Scale,
      links: [
        { name: 'Privacy Policy', href: '/privacy-policy' },
        { name: 'Terms & Conditions', href: '/terms-and-conditions' },
        { name: 'Cookie Policy', href: '/cookie-policy' },
        { name: 'Refund & Cancellation Policy', href: '/refund-policy' },
        { name: 'Disclaimer', href: '/disclaimer' },
        { name: 'Copyright Policy', href: '/copyright-policy' },
        { name: 'DMCA Takedown Request', href: '/dmca' },
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-theme-bg text-theme-body font-inter">
      <Navbar />

      <div className="pt-32 pb-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-primary-blue bg-blue-500/10 px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5">
            <Map className="w-3.5 h-3.5 text-primary-blue" /> Site Navigation Directory
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-theme-heading font-montserrat mt-4 mb-4">
            HTML Sitemap
          </h1>
          <p className="text-sm sm:text-base text-theme-muted max-w-xl mx-auto">
            Explore direct links to every public section, reader page, author tool, and policy document on EbookVala.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sections.map((sec) => {
            const Icon = sec.icon;
            return (
              <div key={sec.title} className="p-6 rounded-3xl bg-theme-card border border-theme glass-card space-y-4">
                <h3 className="text-base font-bold text-theme-heading font-montserrat flex items-center gap-2 pb-2 border-b border-theme">
                  <Icon className="w-4 h-4 text-primary-blue" /> {sec.title}
                </h3>

                <ul className="space-y-2.5 text-xs sm:text-sm font-medium">
                  {sec.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-theme-body hover:text-primary-blue transition-colors flex items-center justify-between group"
                      >
                        <span>{link.name}</span>
                        <span className="text-xs text-theme-muted group-hover:translate-x-1 transition-transform">→</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      <Footer />
    </main>
  );
}
