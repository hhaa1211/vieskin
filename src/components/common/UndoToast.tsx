import React, { useEffect, useState } from 'react';
import { RotateCcw, X, AlertCircle } from 'lucide-react';

interface UndoToastProps {
  message: string;
  onUndo: () => void;
  onDismiss: () => void;
  duration?: number; // default 6000ms
}

export const UndoToast: React.FC<UndoToastProps> = ({
  message,
  onUndo,
  onDismiss,
  duration = 6000
}) => {
  const [progress, setProgress] = useState(100);
  const onDismissRef = React.useRef(onDismiss);

  React.useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remainingPct = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remainingPct);
      if (elapsed >= duration) {
        clearInterval(interval);
        onDismissRef.current();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [duration]);

  return (
    <div 
      role="status"
      aria-live="polite"
      className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md bg-stone-900/98 text-stone-100 dark:bg-stone-100 dark:text-stone-900 rounded-2xl shadow-2xl border border-stone-700/80 dark:border-stone-300 p-3.5 backdrop-blur-md animate-slideUp overflow-hidden"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <AlertCircle className="w-4 h-4 text-amber-400 dark:text-amber-600 shrink-0" />
          <span className="text-xs font-medium truncate">{message}</span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onUndo}
            className="px-3 py-1.5 min-h-[36px] bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-bold transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Hoàn tác</span>
          </button>

          <button
            type="button"
            onClick={onDismiss}
            aria-label="Đóng thông báo"
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 dark:hover:text-stone-700 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Visual countdown progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-stone-800 dark:bg-stone-300">
        <div 
          className="h-full bg-amber-500 transition-all duration-75 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
