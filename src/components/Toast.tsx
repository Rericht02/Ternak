import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error';
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        const isError = toast.type === 'error';
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold transform transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${
              isError
                ? 'bg-rose-950/95 text-rose-100 border-rose-700 backdrop-blur'
                : 'bg-emerald-950/95 text-emerald-100 border-emerald-700 backdrop-blur'
            }`}
          >
            <div className="flex items-center gap-2">
              {isError ? (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              ) : (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              )}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="p-1 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
