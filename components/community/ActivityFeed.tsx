'use client';

import React, { useState, useEffect } from 'react';
import ActivityFeedItem from './ActivityFeedItem';
import { Activity, Users, RefreshCw } from 'lucide-react';

interface ActivityFeedProps {
  initialItems?: any[];
  compact?: boolean;
}

export default function ActivityFeed({ initialItems, compact = false }: ActivityFeedProps) {
  const [items, setItems] = useState<any[]>(initialItems || []);
  const [filter, setFilter] = useState<'all' | 'following'>('following');
  const [isLoading, setIsLoading] = useState(!initialItems);

  const fetchFeed = async (activeFilter: 'all' | 'following') => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/community/feed?filter=${activeFilter}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (err) {
      console.error('Error fetching activity feed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!initialItems) {
      fetchFeed(filter);
    }
  }, [filter, initialItems]);

  const handleFilterChange = (newFilter: 'all' | 'following') => {
    setFilter(newFilter);
    fetchFeed(newFilter);
  };

  return (
    <div className="space-y-4 font-inter text-theme-text">
      {!compact && (
        <div className="flex items-center justify-between border-b border-theme/60 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-theme-heading font-montserrat">Reader Activity Stream</h3>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-theme-surface border border-theme/60 text-xs">
            <button
              onClick={() => handleFilterChange('following')}
              className={`px-3 py-1 rounded-xl font-bold transition-all ${
                filter === 'following'
                  ? 'bg-amber-500 text-white shadow-sm font-extrabold'
                  : 'text-theme-muted hover:text-theme-heading'
              }`}
            >
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> Following
              </span>
            </button>

            <button
              onClick={() => handleFilterChange('all')}
              className={`px-3 py-1 rounded-xl font-bold transition-all ${
                filter === 'all'
                  ? 'bg-amber-500 text-white shadow-sm font-extrabold'
                  : 'text-theme-muted hover:text-theme-heading'
              }`}
            >
              <span>Explore All</span>
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="p-8 text-center text-xs text-theme-muted">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto text-amber-500 mb-2" />
          Loading activity stream...
        </div>
      ) : items.length === 0 ? (
        <div className="p-8 text-center space-y-2 rounded-3xl bg-theme-card border border-theme glass-card">
          <Activity className="w-8 h-8 text-theme-muted mx-auto" />
          <h4 className="font-bold text-xs text-theme-heading">No Recent Activity</h4>
          <p className="text-[11px] text-theme-muted">
            Follow authors and fellow readers to see their finished books, reviews, and reading clubs!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.slice(0, compact ? 5 : 20).map((item) => (
            <ActivityFeedItem key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
