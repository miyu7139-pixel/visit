import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { ToastInfo } from '../types';

interface ToastProps {
  toasts: ToastInfo[];
  onRemove: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border backdrop-blur-md transition-all duration-300 transform translate-y-0 ${
              isSuccess
                ? 'bg-emerald-50/95 border-emerald-200 text-emerald-900 shadow-emerald-100'
                : isError
                ? 'bg-rose-50/95 border-rose-200 text-rose-900 shadow-rose-100'
                : 'bg-stone-50/95 border-stone-200 text-stone-900 shadow-stone-100'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              {isError && <AlertCircle className="w-5 h-5 text-rose-600" />}
              {!isSuccess && !isError && <Info className="w-5 h-5 text-amber-600" />}
            </div>

            <div className="flex-1 text-sm font-medium leading-relaxed break-keep">
              {toast.message}
            </div>

            <button
              onClick={() => onRemove(toast.id)}
              className="shrink-0 text-stone-400 hover:text-stone-700 transition-colors p-0.5 rounded-lg hover:bg-black/5"
              aria-label="닫기"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
