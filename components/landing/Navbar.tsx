'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Sun, Moon, Menu, X, ChevronDown, Sparkles, BookOpen, 
  Code2, TrendingUp, Zap, Briefcase, Command, ArrowRight, User, LogOut, CheckCircle2,
  ShoppingCart, Heart
} from 'lucide-react';
import { categories } from '@/data/categories';
import { trendingBooks, featuredBook } from '@/data/books';
import { setScrollLocked } from '@/lib/scroll-lock';
import { trackCTAClick } from '@/lib/analytics';
import CartDrawer from '../store/CartDrawer';

const navItems = [
  { label: 'Home', href: '/#hero' },
  { label: 'Store', href: '/books' },
  { label: 'Categories', href: '/#categories', isMegaMenu: true },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [liveCategoryCounts, setLiveCategoryCounts] = useState<Record<string, number>>({});
  const megaMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  // Fetch live category counts for Mega Menu
  useEffect(() => {
    async function loadCategoryCounts() {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          const map: Record<string, number> = {};
          if (data.categories && Array.isArray(data.categories)) {
            data.categories.forEach((cat: any) => {
              if (cat.slug) map[cat.slug] = cat.bookCount || 0;
              if (cat.id) map[cat.id] = cat.bookCount || 0;
            });
          }
          setLiveCategoryCounts(map);
        }
      } catch (err) {
        console.error('Failed to load mega-menu category counts:', err);
      }
    }
    loadCategoryCounts();
  }, []);

  // Real-time Database Search Handler
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/books?search=${encodeURIComponent(searchQuery.trim())}&limit=20`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.books || []);
        }
      } catch (err) {
        console.error('Search API error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close user dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll listener for sticky glass effect & active section observer
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // IntersectionObserver for active section link highlighting
  useEffect(() => {
    const sectionIds = ['hero', 'categories', 'trending', 'team', 'pricing', 'faq'];
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                setActiveSection(id);
              }
            });
          },
          { threshold: 0.3 }
        );
        observer.observe(el);
        observers.push(observer);
      }
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, []);

  // Lock body & Lenis smooth scroll when search modal or mobile menu drawer is open
  useEffect(() => {
    if (isMobileMenuOpen || isSearchOpen) {
      setScrollLocked(true);
    } else {
      setScrollLocked(false);
    }
    return () => {
      setScrollLocked(false);
    };
  }, [isMobileMenuOpen, isSearchOpen]);

  // Keyboard shortcut Cmd+K / Ctrl+K for search modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsMegaMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filtered search items
  const filteredBooks = searchQuery.trim() === '' 
    ? trendingBooks.slice(0, 3)
    : trendingBooks.filter(
        b => b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
             b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
             b.category.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const handleMouseEnterMega = () => {
    if (megaMenuTimeoutRef.current) clearTimeout(megaMenuTimeoutRef.current);
    setIsMegaMenuOpen(true);
  };

  const handleMouseLeaveMega = () => {
    megaMenuTimeoutRef.current = setTimeout(() => {
      setIsMegaMenuOpen(false);
    }, 200);
  };

  const featuredBook = trendingBooks[0];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'glass-nav shadow-lg py-4 sm:py-5'
            : 'bg-transparent py-6 sm:py-7'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* LEFT: Clickable Logo -> Home Always */}
            <Link
              href="/"
              prefetch={true}
              className="flex items-center gap-3.5 group focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl p-1"
              aria-label="EbookVala Home"
            >
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 group-hover:scale-105 transition-transform duration-300 shrink-0">
                <Image
                  src="/logo.png"
                  alt="EbookVala Logo"
                  fill
                  sizes="64px"
                  className="object-contain drop-shadow-md"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-2xl sm:text-3xl tracking-tight text-theme-heading font-montserrat flex items-center gap-0.5">
                  Ebook<span className="text-primary-blue">Vala</span>
                </span>
                <span className="text-xs text-theme-muted font-semibold tracking-wide -mt-1 hidden sm:inline-block">
                  Next-Gen Marketplace
                </span>
              </div>
            </Link>

            {/* CENTER: Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 relative bg-slate-900/10 dark:bg-slate-800/40 p-1.5 rounded-full border border-slate-200/50 dark:border-slate-800/60 backdrop-blur-md">
              {navItems.map((item) => {
                const isActive = activeSection === item.href.replace('#', '');
                if (item.isMegaMenu) {
                  return (
                    <div
                      key={item.label}
                      className="relative"
                      onMouseEnter={handleMouseEnterMega}
                      onMouseLeave={handleMouseLeaveMega}
                    >
                      <button
                        onClick={() => setIsMegaMenuOpen((prev) => !prev)}
                        className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 flex items-center gap-1 ${
                          isActive || isMegaMenuOpen
                            ? 'text-white bg-blue-600 shadow-sm'
                            : 'text-theme-body hover:text-theme-heading hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        {item.label}
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isMegaMenuOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Mega Menu Dropdown */}
                      <AnimatePresence>
                        {isMegaMenuOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[460px] bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-5 z-[100]"
                          >
                            <span className="text-xs font-bold uppercase tracking-wider text-theme-muted mb-3 block px-1">
                              Top Categories
                            </span>
                            <div className="grid grid-cols-2 gap-2">
                              {categories.map((cat) => {
                                const count = liveCategoryCounts[cat.id] ?? 0;
                                const formattedCount = `${count} ${count === 1 ? 'eBook' : 'eBooks'}`;
                                return (
                                  <Link
                                    key={cat.id}
                                    href={`/books?category=${cat.id}`}
                                    onClick={() => setIsMegaMenuOpen(false)}
                                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors group"
                                  >
                                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-primary-blue flex items-center justify-center group-hover:scale-110 transition-transform">
                                      <BookOpen className="w-4 h-4" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                      <span className="text-xs font-semibold text-theme-heading group-hover:text-primary-blue transition-colors truncate">
                                        {cat.name}
                                      </span>
                                      <span className="text-[10px] text-theme-muted">
                                        {formattedCount}
                                      </span>
                                    </div>
                                  </Link>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }

                return (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setActiveSection(item.href.replace('#', ''))}
                    className={`relative px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 ${
                      isActive
                        ? 'text-white bg-blue-600 shadow-sm'
                        : 'text-theme-body hover:text-theme-heading hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    {item.label}
                  </a>
                );
              })}
            </nav>

            {/* RIGHT: Search, User Menu / Sign In */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Standalone Search Trigger Button */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2.5 text-theme-heading hover:text-primary-blue bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 border border-theme rounded-xl transition-all relative flex items-center gap-2 text-xs font-semibold"
                aria-label="Open Search Modal"
              >
                <Search className="w-4 h-4 text-primary-blue" />
                <span className="hidden sm:inline-block text-theme-muted">Search...</span>
                <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-bold text-theme-muted bg-slate-200 dark:bg-slate-700/80 rounded border border-theme">
                  ⌘K
                </kbd>
              </button>

              {/* Auth Session State */}
              {status === 'loading' ? (
                <div className="w-24 h-9 bg-slate-200 dark:bg-slate-800/60 animate-pulse rounded-xl" />
              ) : session?.user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen((prev) => !prev)}
                    className="flex items-center gap-2 p-1.5 rounded-xl border border-theme bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all focus:outline-none"
                    aria-label="User Profile Menu"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                      {session.user.name ? session.user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="hidden sm:inline-block text-xs font-bold text-theme-heading max-w-[100px] truncate">
                      {session.user.name || 'User'}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-theme-muted transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-60 bg-slate-900 dark:bg-slate-950 border border-slate-700/90 rounded-2xl shadow-2xl p-3 z-[100] space-y-1 text-white"
                      >
                        <div className="p-2 border-b border-slate-800 mb-1">
                          <p className="text-xs font-extrabold text-white truncate flex items-center justify-between">
                            <span>{session.user.name || 'Account'}</span>
                            {((session.user as any)?.role === 'ADMIN' || (session.user as any)?.role === 'SUPER_ADMIN') && (
                              <span className="text-[9px] font-black text-amber-400 bg-amber-400/10 border border-amber-400/30 px-1.5 py-0.5 rounded">
                                ADMIN
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {session.user.email}
                          </p>
                        </div>

                        {((session.user as any)?.role === 'ADMIN' || (session.user as any)?.role === 'SUPER_ADMIN') && (
                          <Link
                            href="/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/20 rounded-xl transition-colors"
                          >
                            <Zap className="w-4 h-4 text-amber-400" />
                            <span>Admin Dashboard</span>
                          </Link>
                        )}

                        {((session.user as any)?.isAuthor || (session.user as any)?.role === 'AUTHOR') && (
                          <Link
                            href="/author"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-purple-400 bg-purple-400/10 hover:bg-purple-400/20 border border-purple-400/20 rounded-xl transition-colors"
                          >
                            <Sparkles className="w-4 h-4 text-purple-400" />
                            <span>Author Studio</span>
                          </Link>
                        )}

                        <Link
                          href="/dashboard"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white rounded-xl transition-colors"
                        >
                          <User className="w-4 h-4 text-blue-400" />
                          <span>My Dashboard</span>
                        </Link>
                        <Link
                          href="/books"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white rounded-xl transition-colors"
                        >
                          <BookOpen className="w-4 h-4 text-primary-blue" />
                          <span>eBooks Store</span>
                        </Link>
                        <Link
                          href="/wishlist"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white rounded-xl transition-colors"
                        >
                          <Heart className="w-4 h-4 text-rose-500" />
                          <span>Saved Wishlist</span>
                        </Link>
                        <Link
                          href="/cart"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white rounded-xl transition-colors"
                        >
                          <ShoppingCart className="w-4 h-4 text-emerald-500" />
                          <span>Shopping Cart</span>
                        </Link>
                        <div className="pt-1 border-t border-slate-800">
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              signOut({ callbackUrl: '/' });
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="hidden lg:inline-block px-3.5 py-2 text-sm font-semibold text-theme-heading hover:text-primary-blue transition-colors"
                  >
                    Sign In
                  </Link>
                  <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                    <Link
                      href="/signup"
                      onClick={() => trackCTAClick('Get Started', 'Navbar')}
                      className="relative inline-flex items-center justify-center px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold text-white brand-gradient-bg rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 overflow-hidden group"
                    >
                      <span className="relative z-10 flex items-center gap-1.5">
                        Get Started
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </span>
                      <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    </Link>
                  </motion.div>
                </>
              )}

              {/* Mobile Hamburger Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2.5 text-theme-heading bg-slate-100 dark:bg-slate-800 border border-theme rounded-xl"
                aria-label="Open Mobile Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* SEARCH COMMAND PALETTE MODAL - REAL DATABASE RESULTS */}
      <AnimatePresence>
        {isSearchOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-20 px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSearchOpen(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="relative w-full max-w-2xl bg-theme-card border border-theme rounded-3xl shadow-2xl overflow-hidden z-10 glass-card"
            >
              {/* Search Input Bar */}
              <div className="flex items-center px-4 py-3.5 border-b border-theme/70 bg-slate-500/5">
                <Search className="w-5 h-5 text-primary-blue mr-3 shrink-0" />
                <input
                  type="text"
                  placeholder="Search eBooks by title, author, category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-theme-heading text-sm sm:text-base focus:outline-none placeholder:text-theme-muted font-medium"
                  autoFocus
                />
                {isSearching && (
                  <div className="w-4 h-4 border-2 border-primary-blue border-t-transparent rounded-full animate-spin mr-2 shrink-0" />
                )}
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="p-1 text-theme-muted hover:text-theme-heading rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search Results (Scrollable) */}
              <div className="max-h-96 overflow-y-auto p-4 space-y-2" data-lenis-prevent>
                <div className="text-[11px] font-extrabold text-theme-muted uppercase tracking-wider px-2 mb-1 flex items-center justify-between">
                  <span>{searchQuery ? `Matching Results (${searchResults.length})` : 'Recommended Trending Books'}</span>
                  {searchQuery && (
                    <span className="text-[10px] text-primary-blue font-bold">Real Database Search</span>
                  )}
                </div>

                {searchQuery.trim() === '' ? (
                  // Default Recommended List when empty
                  trendingBooks.slice(0, 4).map((book) => (
                    <Link
                      key={book.id}
                      href={`/books/${(book as any).slug || book.id}`}
                      onClick={() => setIsSearchOpen(false)}
                      className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-transparent hover:border-theme transition-all group"
                    >
                      <div className="relative w-12 h-16 rounded-xl overflow-hidden bg-slate-900 shrink-0 shadow-sm">
                        <Image src={book.coverImage} alt={book.title} fill sizes="48px" className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-extrabold text-theme-heading group-hover:text-primary-blue truncate transition-colors font-montserrat">
                          {book.title}
                        </h4>
                        <p className="text-xs text-theme-muted truncate">
                          By <strong className="text-theme-heading">{book.author}</strong> • <span className="text-blue-400 font-semibold">{book.category}</span>
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-sm font-black text-theme-heading font-stats">
                          ₹{book.discountPrice}
                        </span>
                        <span className="block text-[10px] text-emerald-500 font-bold">
                          {book.discountBadge}
                        </span>
                      </div>
                    </Link>
                  ))
                ) : searchResults.length === 0 && !isSearching ? (
                  <div className="text-center py-10 px-4 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-primary-blue flex items-center justify-center mx-auto border border-blue-500/20">
                      <Search className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-bold text-theme-heading font-montserrat">
                      No Books Found
                    </h4>
                    <p className="text-xs text-theme-muted max-w-xs mx-auto">
                      No eBooks matched &quot;<span className="text-theme-heading font-semibold">{searchQuery}</span>&quot;. Try checking for typos or searching by category name.
                    </p>
                    <div className="pt-2">
                      <Link
                        href="/books"
                        onClick={() => setIsSearchOpen(false)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all"
                      >
                        <span>Browse eBook Store</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ) : (
                  searchResults.map((book) => (
                    <Link
                      key={book.id}
                      href={`/books/${book.slug}`}
                      onClick={() => setIsSearchOpen(false)}
                      className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-transparent hover:border-theme transition-all group"
                    >
                      <div className="relative w-12 h-16 rounded-xl overflow-hidden bg-slate-900 shrink-0 shadow-sm">
                        <Image src={book.coverImageUrl} alt={book.title} fill sizes="48px" className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-extrabold text-theme-heading group-hover:text-primary-blue truncate transition-colors font-montserrat">
                          {book.title}
                        </h4>
                        <p className="text-xs text-theme-muted truncate">
                          By <strong className="text-theme-heading">{book.author?.name || 'Author'}</strong> • <span className="text-purple-400 font-semibold">{book.category?.name || 'Category'}</span>
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-sm font-black text-theme-heading font-stats">
                          ₹{book.price}
                        </span>
                        {book.isBestseller && (
                          <span className="block text-[10px] text-amber-400 font-bold uppercase">
                            Bestseller
                          </span>
                        )}
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MOBILE FULL-SCREEN DRAWER MENU */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-theme-bg/95 backdrop-blur-xl flex flex-col justify-between p-6 md:hidden"
          >
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-theme">
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2"
                >
                  <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-slate-900 border border-slate-700/50">
                    <Image src="/logo.png" alt="Logo" fill sizes="32px" className="object-contain p-0.5" />
                  </div>
                  <span className="font-bold text-lg text-theme-heading font-montserrat">
                    Ebook<span className="text-primary-blue">Vala</span>
                  </span>
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-theme-heading bg-slate-100 dark:bg-slate-800 rounded-xl"
                  aria-label="Close Mobile Menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mt-8 flex flex-col gap-4">
                {navItems.map((item, idx) => (
                  <motion.a
                    key={item.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-xl font-bold text-theme-heading hover:text-primary-blue py-2 transition-colors flex items-center justify-between"
                  >
                    {item.label}
                    <ArrowRight className="w-5 h-5 text-theme-muted" />
                  </motion.a>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-theme flex flex-col gap-4">

              {session?.user ? (
                <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-theme space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center">
                      {session.user.name ? session.user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-theme-heading truncate">
                        {session.user.name || 'Account'}
                      </p>
                      <p className="text-xs text-theme-muted truncate">
                        {session.user.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      signOut({ callbackUrl: '/' });
                    }}
                    className="w-full py-2.5 px-4 font-bold text-xs text-red-500 hover:bg-red-500/10 rounded-xl border border-red-500/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="py-3 text-center text-sm font-bold text-theme-heading bg-slate-100 dark:bg-slate-800 border border-theme rounded-xl"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="py-3 text-center text-sm font-bold text-white brand-gradient-bg rounded-xl shadow-lg shadow-blue-500/25"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
