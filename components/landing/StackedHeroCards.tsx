'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Quote, Clock } from 'lucide-react';
import { HeroQuoteCard } from '@/data/hero-quotes';

interface StackedHeroCardsProps {
  cards: HeroQuoteCard[];
}

export default function StackedHeroCards({ cards }: StackedHeroCardsProps) {
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-rotate fanned stack cards on 3.2s timer
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setActiveCardIndex((prev) => (prev + 1) % cards.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [isHovered, cards.length]);

  const handleNext = () => {
    setActiveCardIndex((prev) => (prev + 1) % cards.length);
  };

  // Stack 3 cards
  const stackPositions = [0, 1, 2].map((offset) => {
    const cardIndex = (activeCardIndex + offset) % cards.length;
    return {
      card: cards[cardIndex],
      offset,
    };
  });

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full max-w-md mx-auto flex flex-col items-center justify-center py-2"
      suppressHydrationWarning
    >
      {/* Stacked Cards Area with Noticeably Increased Premium Height */}
      <div className="relative w-full h-[460px] sm:h-[520px] flex items-center justify-center">
        {/* Glow backdrop behind book stack */}
        <div className="absolute w-72 h-80 sm:w-80 sm:h-[420px] rounded-full bg-gradient-to-tr from-blue-600/30 via-indigo-600/25 to-purple-600/20 blur-3xl animate-pulse-glow pointer-events-none" />

        {/* Render Stacked Cards */}
        {stackPositions.slice().reverse().map(({ card, offset }) => {
          const isFront = offset === 0;
          const isMiddle = offset === 1;
          const isBack = offset === 2;

          // Responsive transformation properties
          const scale = isFront ? 1 : isMiddle ? 0.93 : 0.86;
          const rotate = isFront ? 0 : isMiddle ? 5 : 10;
          const translateX = isFront ? 0 : isMiddle ? 16 : 32;
          const translateY = isFront ? 0 : isMiddle ? 12 : 24;
          const zIndex = isFront ? 30 : isMiddle ? 20 : 10;
          const opacity = isFront ? 1 : isMiddle ? 0.82 : 0.55;
          const blur = isFront ? 'blur(0px)' : isMiddle ? 'blur(0.5px)' : 'blur(1.5px)';

          return (
            <motion.div
              key={card.id}
              onClick={isFront ? handleNext : undefined}
              initial={false}
              animate={{
                scale,
                rotate,
                x: translateX,
                y: translateY,
                opacity,
                zIndex,
                filter: blur,
              }}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 24,
              }}
              className={`absolute w-[270px] h-[410px] sm:w-[310px] sm:h-[470px] rounded-3xl bg-slate-950 border-2 shadow-2xl overflow-hidden cursor-pointer flex flex-col justify-between select-none ${
                isFront
                  ? 'border-blue-500/70 shadow-blue-500/25 shadow-2xl hover:border-blue-400 transition-colors'
                  : 'border-slate-800/90 shadow-xl'
              }`}
            >
              {/* Background Cover Image with Dark Gradient */}
              <div className="absolute inset-0 z-0 bg-slate-950">
                <Image
                  src={card.coverImage}
                  alt={card.title}
                  fill
                  sizes="(max-width: 768px) 270px, 310px"
                  priority={isFront}
                  className="object-cover opacity-30 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/90 to-slate-900/80" />
              </div>

              {/* Top Corner Technical Metadata Bar */}
              <div className={`relative z-10 p-4 sm:p-5 flex items-center justify-between gap-2 transition-opacity duration-300 ${isFront ? 'opacity-100' : 'opacity-40'}`}>
                {/* Monospace Technical Tag */}
                <span className="font-mono text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-blue-400 bg-slate-900/90 border border-blue-500/30 px-2.5 py-1 rounded-md backdrop-blur-md">
                  {card.techMeta}
                </span>

                {/* Bestseller Badge */}
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-amber-400 px-2.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 backdrop-blur-md shadow-sm">
                  {card.badge}
                </span>
              </div>

              {/* Middle & Bottom Content: Quote Overlay & Metadata (Only visible on front card to eliminate text bleeding) */}
              <div className={`relative z-10 px-5 sm:px-6 pb-5 sm:pb-6 my-auto space-y-3.5 transition-opacity duration-300 ${isFront ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400 bg-blue-500/20 px-2.5 py-1 rounded-md border border-blue-400/30">
                    {card.category}
                  </span>
                  <span className="text-[10px] font-mono text-slate-300 flex items-center gap-1 bg-slate-900/70 px-2 py-0.5 rounded-md border border-slate-800">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {card.readTime}
                  </span>
                </div>

                <div className="flex items-start gap-2.5 text-slate-100 bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-slate-800/80 shadow-md">
                  <Quote className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0 mt-0.5 fill-amber-400/20" />
                  <p className="text-xs sm:text-sm font-semibold italic text-white leading-relaxed line-clamp-4">
                    &quot;{card.quote}&quot;
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80">
                  <h3 className="text-xs sm:text-sm font-black text-slate-100 font-montserrat truncate">
                    {card.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                    by {card.author}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
