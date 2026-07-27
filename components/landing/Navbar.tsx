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
import { useTheme } from '@/components/ThemeProvider';
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
  const { theme, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const megaMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  const fetchCartCount = React.useCallback(async () => {
    if (status !== 'authenticated') {
      setCartCount(0);
      return;
    }
    try {
      const res = await fetch('/api/cart');
      if (res.ok) {
        const data = await res.json();
        setCartCount(data.itemCount || 0);
      }
    } catch (err) {
      console.error('Error fetching cart count:', err);
    }
  }, [status]);

  useEffect(() => {
    fetchCartCount();
  }, [fetchCartCount]);

  useEffect(() => {
    const handleCartUpdated = () => fetchCartCount();
    window.addEventListener('cart-updated', handleCartUpdated);
    return () => window.removeEventListener('cart-updated', handleCartUpdated);
  }, [fetchCartCount]);

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
                              {categories.map((cat) => (
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
                                      {cat.bookCount}
                                    </span>
                                  </div>
                                </Link>
                              ))}
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

            {/* RIGHT: Search, Dark/Light Toggle, Login, Magnetic CTA */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Standalone Search Icon Trigger */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2.5 text-theme-heading hover:text-primary-blue bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 border border-theme rounded-xl transition-all relative"
                aria-label="Open Search Modal"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Shopping Cart Drawer Trigger */}
              <button
                onClick={() => setIsCartDrawerOpen(true)}
                className="p-2.5 text-theme-heading hover:text-primary-blue bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 border border-theme rounded-xl transition-all relative shrink-0"
                aria-label="Open Shopping Cart"
              >
                <ShoppingCart className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white font-black text-[9px] min-w-[18px] h-[18px] px-1 rounded-full border-2 border-theme-bg flex items-center justify-center shadow-md font-stats pointer-events-none">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </button>

              {/* Theme Toggle (Sun/Moon Morph) */}
              <button
                onClick={toggleTheme}
                className="p-2.5 text-theme-heading hover:text-primary-blue bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 border border-theme rounded-xl transition-all relative overflow-hidden"
                aria-label="Toggle Theme"
              >
                <motion.div
                  key={theme}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4 text-yellow-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-indigo-600" />
                  )}
                </motion.div>
              </button>

              {/* Auth Session State: User Menu or Sign In / Get Started */}
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
                          <span>Shopping Cart ({cartCount})</span>
                        </Link>
                        <Link
                          href="/account/orders"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white rounded-xl transition-colors"
                        >
                          <Zap className="w-4 h-4 text-indigo-500" />
                          <span>My Orders & Invoices</span>
                        </Link>
                        <Link
                          href="/account/subscription"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white rounded-xl transition-colors"
                        >
                          <Sparkles className="w-4 h-4 text-amber-500" />
                          <span>My Subscription</span>
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

      {/* SEARCH COMMAND PALETTE MODAL */}
      <AnimatePresence>
        {isSearchOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSearchOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="relative w-full max-w-2xl bg-theme-card border border-theme rounded-2xl shadow-2xl overflow-hidden z-10 glass-card"
            >
              {/* Search Bar Input */}
              <div className="flex items-center px-4 py-3 border-b border-theme bg-slate-500/5">
                <Search className="w-5 h-5 text-primary-blue mr-3" />
                <input
                  type="text"
                  placeholder="Search eBooks, authors, categories, or AI summaries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-theme-heading text-sm focus:outline-none placeholder:text-theme-muted font-medium"
                  autoFocus
                />
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="p-1 text-theme-muted hover:text-theme-heading rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search Results */}
              <div className="max-h-96 overflow-y-auto p-4 space-y-3">
                <div className="text-[11px] font-bold text-theme-muted uppercase tracking-wider px-2">
                  {searchQuery ? 'Search Results' : 'Recommended Trending Books'}
                </div>
                {filteredBooks.length === 0 ? (
                  <div className="text-center py-10 px-4 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-primary-blue flex items-center justify-center mx-auto border border-blue-500/20">
                      <Search className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-bold text-theme-heading font-montserrat">
                      No Search Results Found
                    </h4>
                    <p className="text-xs text-theme-muted max-w-xs mx-auto">
                      We couldn&apos;t find any eBooks matching &quot;<span className="text-theme-heading font-semibold">{searchQuery}</span>&quot;. Try checking for typos or searching by author name.
                    </p>
                    <div className="pt-2">
                      <Link
                        href="/books"
                        onClick={() => setIsSearchOpen(false)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all"
                      >
                        <span>Browse All Store eBooks</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ) : (
                  filteredBooks.map((book) => (
                    <Link
                      key={book.id}
                      href={`/books/${(book as any).slug || book.id}`}
                      onClick={() => setIsSearchOpen(false)}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors group"
                    >
                      <div className="relative w-12 h-16 rounded-md overflow-hidden bg-slate-800 shrink-0">
                        <Image
                          src={book.coverImage}
                          alt={book.title}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-theme-heading group-hover:text-primary-blue truncate transition-colors">
                          {book.title}
                        </h4>
                        <p className="text-xs text-theme-muted truncate">
                          {book.author} • <span className="text-primary-blue">{book.category}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-theme-heading">
                          ₹{book.discountPrice}
                        </span>
                        <span className="block text-[10px] text-green-500 font-semibold">
                          {book.discountBadge}
                        </span>
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
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-theme-muted">Theme Preference</span>
                <button
                  onClick={toggleTheme}
                  className="p-2.5 text-theme-heading bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center gap-2 text-xs font-bold"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </button>
              </div>

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

      {/* Cart Slide-in Drawer */}
      <CartDrawer isOpen={isCartDrawerOpen} onClose={() => setIsCartDrawerOpen(false)} />
    </>
  );
}
