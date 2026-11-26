'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X, ExternalLink } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
  txHash?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 6000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-white shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-zinc-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-white shrink-0" />,
  };

  const borders = {
    success: 'border-zinc-500',
    error: 'border-zinc-700',
    info: 'border-zinc-600',
  };

  return (
    <div
      className={`pointer-events-auto bg-[#18181b] text-white border ${borders[toast.type]} rounded-xl p-4 shadow-2xl flex items-start gap-3 transition-all duration-300 font-sans`}
      role="alert"
    >
      <div className="mt-0.5">{icons[toast.type]}</div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-white tracking-tight">{toast.title}</h4>
        <p className="text-xs text-zinc-300 mt-0.5 leading-relaxed break-words">{toast.message}</p>
        {toast.txHash && (
          <a
            href={`https://stellar.expert/explorer/testnet/tx/${toast.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-white mt-1.5 underline underline-offset-2 transition-colors"
          >
            <span>Tx: {toast.txHash.slice(0, 8)}...{toast.txHash.slice(-6)}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-zinc-400 hover:text-white p-1 rounded-md transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center shrink-0"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
