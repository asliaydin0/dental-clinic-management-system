import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, AlertCircle, Info, X, HelpCircle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ConfirmState {
  message: string;
  resolve: (value: boolean) => void;
}

interface ToastContextType {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  addToast: (message: string, type: ToastType) => void;
  confirm: (message: string) => Promise<boolean>;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((message: string) => addToast(message, 'success'), [addToast]);
  const error = useCallback((message: string) => addToast(message, 'error'), [addToast]);
  const info = useCallback((message: string) => addToast(message, 'info'), [addToast]);

  const confirm = useCallback((message: string) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({
        message,
        resolve,
      });
    });
  }, []);

  return (
    <ToastContext.Provider value={{ success, error, info, addToast, confirm }}>
      {children}
      {/* Toast container on screen */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            let bgColor = 'bg-white border-slate-200 dark:bg-[#0e1626] dark:border-slate-800';
            let textColor = 'text-slate-800 dark:text-slate-200';
            let icon = <Info className="h-5 w-5 text-blue-500 shrink-0" />;
            let borderColor = 'border-blue-500/20';

            if (toast.type === 'success') {
              bgColor = 'bg-emerald-50 border-emerald-200 dark:bg-[#062419] dark:border-emerald-800/60';
              textColor = 'text-emerald-850 dark:text-emerald-200';
              icon = <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />;
              borderColor = 'border-emerald-500/20';
            } else if (toast.type === 'error') {
              bgColor = 'bg-rose-50 border-rose-200 dark:bg-[#2d1217] dark:border-rose-800/60';
              textColor = 'text-rose-850 dark:text-rose-200';
              icon = <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />;
              borderColor = 'border-rose-500/20';
            } else if (toast.type === 'info') {
              bgColor = 'bg-blue-50 border-blue-200 dark:bg-[#0a182d] dark:border-blue-800/60';
              textColor = 'text-blue-850 dark:text-blue-200';
              icon = <Info className="h-5 w-5 text-blue-500 shrink-0" />;
              borderColor = 'border-blue-500/20';
            }

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -20, scale: 0.9, x: 20 }}
                animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: 50, transition: { duration: 0.2 } }}
                layout
                className={`p-4 rounded-2xl border shadow-xl flex items-start gap-3 backdrop-blur-md pointer-events-auto ${bgColor} ${borderColor} ${textColor}`}
              >
                {icon}
                <div className="flex-1 text-xs font-semibold leading-relaxed">
                  {toast.message}
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer shrink-0"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmState && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-[#0e1626] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 max-w-sm w-full"
            >
              <div className="flex items-center gap-2.5 mb-3">
                <HelpCircle className="h-5 w-5 text-rose-500" />
                <h3 className="text-sm font-black text-slate-950 dark:text-white">Onay Gerekli</h3>
              </div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                {confirmState.message}
              </p>
              <div className="flex justify-end gap-3 font-semibold">
                <button
                  onClick={() => {
                    confirmState.resolve(false);
                    setConfirmState(null);
                  }}
                  className="px-4 py-2 text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer border border-slate-200 dark:border-slate-800 bg-transparent font-bold outline-none"
                >
                  İptal
                </button>
                <button
                  onClick={() => {
                    confirmState.resolve(true);
                    setConfirmState(null);
                  }}
                  className="px-4 py-2 text-xs text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all cursor-pointer font-bold border-none outline-none"
                >
                  Onayla
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ToastContext.Provider>
  );
};
