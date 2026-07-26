'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Zap, Share2, BookOpen, Globe, FileText, Check, Sparkles } from 'lucide-react';
import WishlistButton from './WishlistButton';
import PriceTag from './PriceTag';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';

export interface BookDetailHeroData {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverImageUrl: string;
  price: number;
  originalPrice?: number | null;
  discountPercent?: number | null;
  rating: number;
  reviewCount: number;
  pageCount: number;
  language: string;
  format: string;
  isBestseller?: boolean;
  isFeatured?: boolean;
  author: {
    name: string;
    slug: string;
    avatarUrl?: string | null;
  };
  category: {
    name: string;
    slug: string;
  };
}

interface BookDetailHeroProps {
  book: BookDetailHeroData;
}

export default function BookDetailHero({ book }: BookDetailHeroProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const handleAddToCart = async () => {
    if (!session || !session.user) {
      const callbackUrl = encodeURIComponent(pathname);
      router.push(`/login?callbackUrl=${callbackUrl}`);
      return;
    }

    setIsAddingToCart(true);

    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId: book.id, quantity: 1 }),
      });

      if (res.ok) {
        setIsAddedToCart(true);
        window.dispatchEvent(new Event('cart-updated'));
        setTimeout(() => setIsAddedToCart(false), 2500);
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!session || !session.user) {
      const callbackUrl = encodeURIComponent(pathname);
      router.push(`/login?callbackUrl=${callbackUrl}`);
      return;
    }
    await handleAddToCart();
    router.push('/cart');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
      {/* Cover Image Left */}
      <div className="lg:col-span-5 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative w-full max-w-sm aspect-[3/4] rounded-3xl bg-slate-950 border-2 border-theme shadow-2xl overflow-hidden group"
        >
          <Image
            src={book.coverImageUrl}
            alt={book.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 40vw"
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />

          {/* Absolute Badges */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            {book.isBestseller && (
              <span className="text-xs font-black uppercase text-amber-400 bg-slate-900/90 border border-amber-400/40 px-3 py-1 rounded-full backdrop-blur-md flex items-center gap-1 shadow-md">
                <Sparkles className="w-3.5 h-3.5 fill-amber-400" /> Bestseller
              </span>
            )}
          </div>

          <div className="absolute top-4 right-4 z-10">
            <WishlistButton bookId={book.id} iconSize={20} />
          </div>
        </motion.div>
      </div>

      {/* Book Details Right */}
      <div className="lg:col-span-7 space-y-6">
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <Link
              href={`/categories/${book.category.slug}`}
              className="text-xs font-extrabold uppercase tracking-wider text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1 rounded-lg border border-blue-400/30 transition-colors"
            >
              {book.category.name}
            </Link>
            <span className="text-xs text-theme-muted">•</span>
            <span className="text-xs text-theme-muted font-medium">Digital Instant eBook</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-theme-heading leading-tight font-montserrat">
            {book.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm">
            <Link
              href={`/authors/${book.author.slug}`}
              className="flex items-center gap-2 font-semibold text-theme-heading hover:text-primary-blue transition-colors"
            >
              {book.author.avatarUrl && (
                <div className="relative w-6 h-6 rounded-full overflow-hidden border border-theme">
                  <Image src={book.author.avatarUrl} alt={book.author.name} fill className="object-cover" />
                </div>
              )}
              <span>By {book.author.name}</span>
            </Link>

            <span className="text-theme-muted">•</span>

            <div className="flex items-center gap-1 text-amber-400 font-bold">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>{book.rating.toFixed(1)}</span>
              <span className="text-xs text-theme-muted font-normal">({book.reviewCount} reviews)</span>
            </div>
          </div>
        </div>

        {/* Quick Spec Pills */}
        <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-theme-card border border-theme glass-card">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-primary-blue shrink-0" />
            <div>
              <span className="text-[10px] text-theme-muted uppercase tracking-wider block font-bold">Length</span>
              <span className="text-xs font-bold text-theme-heading">{book.pageCount} Pages</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Globe className="w-5 h-5 text-purple-500 shrink-0" />
            <div>
              <span className="text-[10px] text-theme-muted uppercase tracking-wider block font-bold">Language</span>
              <span className="text-xs font-bold text-theme-heading">{book.language}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-emerald-500 shrink-0" />
            <div>
              <span className="text-[10px] text-theme-muted uppercase tracking-wider block font-bold">Format</span>
              <span className="text-xs font-bold text-theme-heading truncate">{book.format}</span>
            </div>
          </div>
        </div>

        {/* Pricing Box */}
        <div className="p-6 rounded-3xl bg-theme-card border border-theme glass-card space-y-4 shadow-sm">
          <PriceTag price={book.price} originalPrice={book.originalPrice} discountPercent={book.discountPercent} size="lg" />

          {/* Action CTAs */}
          <div className="space-y-3 pt-2">
            <Link
              href={`/reader/${book.id}`}
              className="w-full py-4 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all"
            >
              <BookOpen className="w-5 h-5" />
              <span>Start Reading eBook</span>
            </Link>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className={`px-6 py-3.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg ${
                  isAddedToCart
                    ? 'bg-emerald-600 text-white'
                    : 'text-white brand-gradient-bg shadow-blue-500/25 hover:shadow-blue-500/40'
                }`}
              >
                {isAddingToCart ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isAddedToCart ? (
                  <>
                    <Check className="w-5 h-5" /> Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" /> Add to Cart
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                className="px-6 py-3.5 rounded-xl text-sm font-bold text-theme-heading bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-theme flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <Zap className="w-5 h-5 text-amber-500" />
                <span>Buy Now</span>
              </button>
            </div>
          </div>

          {/* Share Button */}
          <div className="pt-2 flex items-center justify-between text-xs text-theme-muted">
            <span className="flex items-center gap-1.5 text-emerald-500 font-medium">
              <Check className="w-3.5 h-3.5" /> Instant Lifetime Access
            </span>
            <button
              onClick={handleShare}
              className="flex items-center gap-1 hover:text-primary-blue transition-colors font-medium"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedShare ? 'Link Copied!' : 'Share Book'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
