import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, XCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) setTimeout(onClose, 300); // Wait for exit animation
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const config = {
    success: {
      icon: CheckCircle2,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20'
    },
    error: {
      icon: XCircle,
      color: 'text-rose-500',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20'
    },
    warning: {
      icon: AlertCircle,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20'
    },
    info: {
      icon: Info,
      color: 'text-sky-500',
      bg: 'bg-sky-500/10',
      border: 'border-sky-500/20'
    },
  }[type] || { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };

  const IconComponent = config.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          layout
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="pointer-events-auto flex w-full max-w-sm rounded-2xl bg-white/70 backdrop-blur-2xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-1 overflow-hidden"
        >
          <div className="flex w-full items-start p-3 gap-3">
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${config.bg} ${config.border} border`}>
              <IconComponent size={18} className={config.color} strokeWidth={3} />
            </div>
            
            <div className="flex-1 pt-1.5 min-w-0">
              <p className="text-sm font-bold text-slate-800 leading-snug truncate pr-2">
                {message}
              </p>
            </div>

            <button
              onClick={() => {
                setIsVisible(false);
                if (onClose) setTimeout(onClose, 300);
              }}
              className="flex-shrink-0 p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-lg transition-colors mt-0.5"
            >
              <X size={16} strokeWidth={3} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const ToastContainer = ({ toasts = [], removeToast }) => {
  return (
    <div
      aria-live="assertive"
      className="pointer-events-none fixed inset-0 flex flex-col items-center sm:items-end px-4 py-6 gap-3 z-[9999]"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
