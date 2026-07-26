'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import PriceTag from './PriceTag';

export interface CartItemData {
  id: string;
  quantity: number;
  book: {
    id: string;
    slug: string;
    title: string;
    coverImageUrl: string;
    price: number;
    originalPrice?: number | null;
    discountPercent?: number | null;
    author: {
      name: string;
      slug: string;
    };
  };
}

interface CartItemProps {
  item: CartItemData;
  onRemove: (bookId: string) => void;
  onUpdateQuantity?: (bookId: string, quantity: number) => void;
  compact?: boolean;
}

export default function CartItem({
  item,
  onRemove,
  compact = false,
}: CartItemProps) {
  return (
    <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-theme-surface border border-theme/70 hover:border-theme transition-all">
      {/* Cover Image Thumbnail */}
      <Link
        href={`/books/${item.book.slug}`}
        className="relative w-16 h-20 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-theme"
      >
        <Image
          src={item.book.coverImageUrl}
          alt={item.book.title}
          fill
          sizes="80px"
          className="object-cover"
        />
      </Link>

      {/* Info Middle */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/books/${item.book.slug}`}
          className="text-xs sm:text-sm font-bold text-theme-heading hover:text-primary-blue transition-colors line-clamp-1 font-montserrat"
        >
          {item.book.title}
        </Link>
        <span className="text-[10px] text-theme-muted block mt-0.5 line-clamp-1">
          By {item.book.author.name}
        </span>
        <div className="mt-1.5 flex items-center justify-between">
          <PriceTag
            price={item.book.price}
            originalPrice={item.book.originalPrice}
            size="sm"
          />
        </div>
      </div>

      {/* Remove Action Button */}
      <button
        onClick={() => onRemove(item.book.id)}
        className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors shrink-0"
        aria-label="Remove item"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
