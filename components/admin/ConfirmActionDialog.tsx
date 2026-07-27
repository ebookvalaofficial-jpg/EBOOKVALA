'use client';

import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

export interface ConfirmActionDialogProps {
  isOpen: boolean;
  title: string;
  message?: React.ReactNode;
  description?: React.ReactNode;
  confirmLabel?: string;
  confirmText?: string;
  confirmButtonClass?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
  onClose?: () => void;
}

export default function ConfirmActionDialog({
  isOpen,
  title,
  message,
  description,
  confirmLabel,
  confirmText,
  confirmButtonClass,
  isDestructive = true,
  isLoading = false,
  onConfirm,
  onCancel,
  onClose,
}: ConfirmActionDialogProps) {
  if (!isOpen) return null;

  const bodyContent = description || message;
  const buttonLabel = confirmText || confirmLabel || 'Confirm';
  const handleDismiss = onClose || onCancel || (() => {});

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-inter">
      <div className="w-full max-w-md p-6 rounded-3xl bg-theme-card border border-theme glass-card shadow-2xl space-y-4 animate-scale-in">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl ${isDestructive ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'}`}>
            <AlertTriangle className="w-6 h-6 shrink-0" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-theme-heading font-montserrat">{title}</h3>
            <div className="text-xs text-theme-muted mt-0.5">{bodyContent}</div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-theme/50">
          <button
            type="button"
            onClick={handleDismiss}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-theme-muted hover:text-theme-heading transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 ${
              confirmButtonClass
                ? confirmButtonClass
                : isDestructive
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
