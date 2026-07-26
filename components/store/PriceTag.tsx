import React from 'react';

interface PriceTagProps {
  price: number;
  originalPrice?: number | null;
  discountPercent?: number | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function PriceTag({
  price,
  originalPrice,
  discountPercent,
  size = 'md',
  className = '',
}: PriceTagProps) {
  const sizeClasses = {
    sm: {
      current: 'text-sm font-bold text-primary-blue',
      original: 'text-xs text-theme-muted line-through',
      badge: 'text-[10px] font-extrabold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20',
    },
    md: {
      current: 'text-lg font-black text-primary-blue font-stats',
      original: 'text-sm text-theme-muted line-through font-stats',
      badge: 'text-xs font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/30',
    },
    lg: {
      current: 'text-2xl sm:text-3xl font-black text-primary-blue font-stats',
      original: 'text-base sm:text-lg text-theme-muted line-through font-stats',
      badge: 'text-xs sm:text-sm font-black text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30',
    },
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      <span className={currentSize.current}>₹{price.toLocaleString()}</span>
      {originalPrice && originalPrice > price && (
        <span className={currentSize.original}>₹{originalPrice.toLocaleString()}</span>
      )}
      {discountPercent && discountPercent > 0 && (
        <span className={currentSize.badge}>{discountPercent}% OFF</span>
      )}
    </div>
  );
}
