'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="bg-black text-white font-sans min-h-screen flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4 p-8 rounded-3xl border border-red-500/30 bg-neutral-900">
          <h1 className="text-2xl font-bold text-red-500">Critical Application Error</h1>
          <p className="text-sm text-neutral-400">
            A critical error occurred while initializing EbookVala. Please try refreshing the page.
          </p>
          <button
            onClick={() => reset()}
            className="px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-xs uppercase tracking-wider"
          >
            Refresh Page
          </button>
        </div>
      </body>
    </html>
  );
}
