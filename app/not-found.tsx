import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { BookOpen, Search, Home, Sparkles, Compass } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-theme-bg text-theme-body flex flex-col justify-between pt-28 pb-16 font-inter">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col items-center justify-center text-center space-y-8 my-auto">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 font-mono">
            404 — PAGE NOT FOUND
          </span>
          <h1 className="text-4xl sm:text-6xl font-black font-montserrat text-theme-heading tracking-tight">
            Lost in the Library? 📚
          </h1>
          <p className="text-sm text-theme-muted max-w-lg mx-auto leading-relaxed">
            The page or eBook link you followed might have been moved, renamed, or deleted. Let us help you find what you were looking for.
          </p>
        </div>

        {/* Search Bar */}
        <form action="/books" method="GET" className="w-full max-w-md">
          <div className="relative">
            <Search className="w-5 h-5 text-theme-muted absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              name="q"
              placeholder="Search by book title, author, or keyword..."
              className="w-full pl-12 pr-4 py-3.5 bg-theme-card border border-theme rounded-2xl text-sm font-medium text-theme-heading placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
            />
          </div>
        </form>

        {/* Quick Navigation Shortcuts */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-lg">
          <Link
            href="/"
            className="p-3.5 rounded-2xl bg-theme-card border border-theme hover:border-blue-500/50 transition-all flex flex-col items-center gap-1.5 group"
          >
            <Home className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-theme-heading">Home Page</span>
          </Link>

          <Link
            href="/books"
            className="p-3.5 rounded-2xl bg-theme-card border border-theme hover:border-purple-500/50 transition-all flex flex-col items-center gap-1.5 group"
          >
            <BookOpen className="w-5 h-5 text-purple-500 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-theme-heading">Book Store</span>
          </Link>

          <Link
            href="/blog"
            className="p-3.5 rounded-2xl bg-theme-card border border-theme hover:border-amber-500/50 transition-all flex flex-col items-center gap-1.5 group"
          >
            <Sparkles className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-theme-heading">Read Blog</span>
          </Link>

          <Link
            href="/dashboard"
            className="p-3.5 rounded-2xl bg-theme-card border border-theme hover:border-emerald-500/50 transition-all flex flex-col items-center gap-1.5 group"
          >
            <Compass className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-theme-heading">My Library</span>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
