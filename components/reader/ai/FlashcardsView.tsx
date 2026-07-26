'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RotateCw, CheckCircle, RefreshCcw, Layers, ArrowRight, ArrowLeft } from 'lucide-react';
import AIFeatureGate from './AIFeatureGate';

interface FlashcardItem {
  id?: string;
  question: string;
  answer: string;
}

interface FlashcardsViewProps {
  bookId: string;
  chapterId?: string;
  userPlan?: string;
  isUnlocked?: boolean;
}

export default function FlashcardsView({
  bookId,
  chapterId,
  userPlan = 'FREE',
  isUnlocked = false,
}: FlashcardsViewProps) {
  const [cards, setCards] = useState<FlashcardItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [stillLearning, setStillLearning] = useState<FlashcardItem[]>([]);
  const [knownCount, setKnownCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFlashcards = async () => {
    if (!isUnlocked) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId, chapterId }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to generate flashcards');
        return;
      }

      setCards(data.flashcards || []);
      setCurrentIndex(0);
      setIsFlipped(false);
      setStillLearning([]);
      setKnownCount(0);
    } catch (err) {
      setError('Error generating flashcards');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFlashcards();
  }, [bookId, chapterId, isUnlocked]);

  const currentCard = cards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleKnowIt = () => {
    setKnownCount((prev) => prev + 1);
    handleNext();
  };

  const handleStillLearning = () => {
    if (currentCard) {
      setStillLearning((prev) => [...prev, currentCard]);
    }
    handleNext();
  };

  const handleReshuffleLearning = () => {
    if (stillLearning.length === 0) return;
    setCards([...stillLearning]);
    setStillLearning([]);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  if (!isUnlocked) {
    return (
      <AIFeatureGate featureName="AI Study Flashcards" requiredPlan="PLUS" userPlan={userPlan}>
        <div />
      </AIFeatureGate>
    );
  }

  return (
    <div className="p-6 rounded-3xl bg-theme-card border border-theme glass-card space-y-6 text-theme-text shadow-xl">
      <div className="flex items-center justify-between pb-3 border-b border-theme/60">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-purple-400" />
          <h3 className="text-base font-bold text-theme-heading font-montserrat">AI Study Flashcards</h3>
        </div>

        {cards.length > 0 && (
          <span className="text-xs font-bold text-theme-muted">
            Card {currentIndex + 1} of {cards.length}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-xs font-bold text-theme-muted space-y-2">
          <RotateCw className="w-6 h-6 animate-spin mx-auto text-purple-500" />
          <p>Synthesizing key concepts into flashcards...</p>
        </div>
      ) : error ? (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold">
          {error}
        </div>
      ) : cards.length === 0 ? (
        <div className="p-8 text-center text-xs text-theme-muted">No flashcards available.</div>
      ) : (
        <div className="space-y-6">
          {/* Flip Card Container */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="perspective-1000 min-h-[220px] cursor-pointer"
          >
            <motion.div
              className="relative w-full min-h-[220px] p-6 rounded-3xl bg-theme-surface/70 border border-theme/60 shadow-lg flex flex-col justify-between"
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {!isFlipped ? (
                // Front: Question
                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-400">
                    Question (Click to Flip)
                  </span>
                  <p className="text-base font-extrabold text-theme-heading font-montserrat">
                    {currentCard?.question}
                  </p>
                </div>
              ) : (
                // Back: Answer
                <div className="space-y-3" style={{ transform: 'rotateY(180deg)' }}>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                    Answer Core Insight
                  </span>
                  <p className="text-sm font-semibold text-theme-text leading-relaxed">
                    {currentCard?.answer}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] font-bold text-theme-muted pt-4 border-t border-theme/40">
                <span>Click card to reveal {isFlipped ? 'question' : 'answer'}</span>
                <RotateCw className="w-3.5 h-3.5" />
              </div>
            </motion.div>
          </div>

          {/* Self-Assessment & Navigation Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="p-2.5 rounded-2xl border border-theme/60 hover:bg-slate-500/10 disabled:opacity-30 transition-colors"
                title="Previous Card"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <button
                onClick={handleNext}
                disabled={currentIndex === cards.length - 1}
                className="p-2.5 rounded-2xl border border-theme/60 hover:bg-slate-500/10 disabled:opacity-30 transition-colors"
                title="Next Card"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleStillLearning}
                className="px-4 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
                <span>Still Learning ({stillLearning.length})</span>
              </button>

              <button
                onClick={handleKnowIt}
                className="px-4 py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-600 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Know It ({knownCount})</span>
              </button>
            </div>
          </div>

          {/* Reshuffle Still Learning deck button */}
          {stillLearning.length > 0 && currentIndex === cards.length - 1 && (
            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-center space-y-2">
              <p className="text-xs font-bold text-purple-400">
                You have {stillLearning.length} cards to review again!
              </p>
              <button
                onClick={handleReshuffleLearning}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-500 transition-colors"
              >
                Review Still Learning Deck
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
