'use client';

import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface BookSearchProps {
  value: string;
  onChange: (search: string) => void;
  placeholder?: string;
  className?: string;
}

export default function BookSearch({
  value,
  onChange,
  placeholder = 'Search by title, author, or keyword...',
  className = '',
}: BookSearchProps) {
  const [searchTerm, setSearchTerm] = useState(value);

  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  useEffect(() => {
    const handler = setTimeout(() => {
      onChange(searchTerm);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm, onChange]);

  return (
    <div className={`relative flex items-center w-full ${className}`}>
      <Search className="absolute left-4 w-5 h-5 text-theme-muted pointer-events-none" />
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-theme-surface border border-theme text-sm text-theme-heading placeholder:text-theme-muted focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
      />
      {searchTerm && (
        <button
          onClick={() => {
            setSearchTerm('');
            onChange('');
          }}
          className="absolute right-3.5 p-1 rounded-full text-theme-muted hover:text-theme-heading hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
