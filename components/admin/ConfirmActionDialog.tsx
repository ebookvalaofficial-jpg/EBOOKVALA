'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmActionDialogProps {
  isOpen: boolean;
  title: string;
  description: React.ReactNode;
  confirmText?: string;
  confirmButtonClass?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmActionDialog({
  isOpen,
  title,
  description,
  confirmText = 'Confirm',
  confirmButtonClass = 'bg-red-600 hover:bg-red-500 text-white',
  isLoading = false,
  onConfirm,
  onClose,
}: ConfirmActionDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md p-6 rounded-3xl bg-theme-card border border-theme glass-card shadow-2xl space-y-4 animate-scale-up text-theme-text">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-full border border-theme/60 hover:bg-slate-500/10 text-theme-muted hover:text-theme-heading transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-theme-heading font-montserrat">{title}</h3>
            <p className="text-xs text-theme-muted mt-0.5">Please review before executing action</p>
          </div>
        </div>

        <div className="text-xs font-semibold text-theme-muted leading-relaxed bg-theme-surface/50 p-4 rounded-2xl border border-theme/40">
          {description}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-2xl border border-theme/60 text-xs font-bold hover:bg-slate-500/10 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-md flex items-center gap-2 ${confirmButtonClass}`}
          >
            {isLoading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>{confirmText}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
