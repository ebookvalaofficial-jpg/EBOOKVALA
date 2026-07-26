'use client';

import React, { useState, useEffect } from 'react';
import { ThumbsUp, Lightbulb, Heart, RefreshCw } from 'lucide-react';

interface ReactionBarProps {
  targetType: 'DISCUSSION' | 'REPLY' | 'REVIEW';
  targetId: string;
  initialCounts?: { LIKE: number; INSIGHTFUL: number; LOVE: number };
  initialUserReaction?: string | null;
}

export default function ReactionBar({
  targetType,
  targetId,
  initialCounts = { LIKE: 0, INSIGHTFUL: 0, LOVE: 0 },
  initialUserReaction = null,
}: ReactionBarProps) {
  const [counts, setCounts] = useState(initialCounts);
  const [userReaction, setUserReaction] = useState<string | null>(initialUserReaction);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Fetch initial reactions if not provided
    const fetchReactions = async () => {
      try {
        const res = await fetch(`/api/community/reactions?targetType=${targetType}&targetId=${targetId}`);
        if (res.ok) {
          const data = await res.json();
          setCounts(data.counts);
          setUserReaction(data.userReaction);
        }
      } catch (err) {
        console.error('Error fetching reaction bar stats:', err);
      }
    };

    fetchReactions();
  }, [targetType, targetId]);

  const handleReact = async (type: 'LIKE' | 'INSIGHTFUL' | 'LOVE') => {
    setIsLoading(true);

    try {
      const res = await fetch('/api/community/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType, targetId, type }),
      });

      const data = await res.json();
      if (res.ok) {
        setCounts(data.counts);
        setUserReaction(data.userReaction);
      }
    } catch (err) {
      console.error('Error toggling reaction:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const reactionButtons = [
    { key: 'LIKE', label: 'Like', icon: ThumbsUp, color: 'text-blue-500 bg-blue-500/10 border-blue-500/30' },
    { key: 'INSIGHTFUL', label: 'Insightful', icon: Lightbulb, color: 'text-amber-500 bg-amber-500/10 border-amber-500/30' },
    { key: 'LOVE', label: 'Love', icon: Heart, color: 'text-red-500 bg-red-500/10 border-red-500/30' },
  ];

  return (
    <div className="inline-flex items-center gap-1.5 font-inter">
      {reactionButtons.map((btn) => {
        const Icon = btn.icon;
        const isActive = userReaction === btn.key;
        const count = counts[btn.key as keyof typeof counts] || 0;

        return (
          <button
            key={btn.key}
            onClick={() => handleReact(btn.key as any)}
            disabled={isLoading}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              isActive
                ? `${btn.color} font-extrabold shadow-sm scale-105`
                : 'bg-theme-surface/50 border-theme/40 text-theme-muted hover:text-theme-heading hover:bg-theme-surface'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? 'fill-current' : ''}`} />
            <span>{btn.label}</span>
            {count > 0 && <span className="text-[10px] opacity-80">({count})</span>}
          </button>
        );
      })}
    </div>
  );
}
