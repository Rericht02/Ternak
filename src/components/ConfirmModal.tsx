import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Lanjutkan',
  cancelLabel = 'Batal',
  isDanger = true,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all border border-slate-100">
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              isDanger ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-800">{title}</h3>
        </div>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">{message}</p>
        <div className="flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-semibold text-white rounded-xl shadow-sm transition cursor-pointer ${
              isDanger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
