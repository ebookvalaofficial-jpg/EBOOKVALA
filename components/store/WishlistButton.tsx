'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { Heart } from 'lucide-react';

interface WishlistButtonProps {
  bookId: string;
  initialWishlisted?: boolean;
  className?: string;
  iconSize?: number;
}

export default function WishlistButton({
  bookId,
  initialWishlisted = false,
  className = '',
  iconSize = 18,
}: WishlistButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
  const [isLoading, setIsLoading] = useState(false);

  // Sync if initialWishlisted changes from parent
  useEffect(() => {
    setIsWishlisted(initialWishlisted);
  }, [initialWishlisted]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session || !session.user) {
      // Redirect guest to login with callback URL
      const callbackUrl = encodeURIComponent(pathname);
      router.push(`/login?callbackUrl=${callbackUrl}`);
      return;
    }

    // Optimistic UI update
    const previousState = isWishlisted;
    setIsWishlisted(!previousState);
    setIsLoading(true);

    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId }),
      });

      const data = await res.json();
      if (!res.ok) {
        // Rollback state on error
        setIsWishlisted(previousState);
      } else {
        setIsWishlisted(data.wishlisted);
      }
    } catch (err) {
      console.error('Wishlist toggle error:', err);
      setIsWishlisted(previousState);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      className={`p-2.5 rounded-full backdrop-blur-md transition-all duration-300 ${
        isWishlisted
          ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 scale-105'
          : 'bg-slate-900/60 text-slate-300 hover:text-rose-500 hover:bg-slate-900/90 border border-slate-700/60'
      } ${className}`}
    >
      <Heart
        size={iconSize}
        className={`transition-transform duration-300 ${
          isWishlisted ? 'fill-white stroke-white scale-110' : 'hover:scale-110'
        }`}
      />
    </button>
  );
}
