"use client";

import { cn } from "@/lib/utils/helper";
import { useEffect, useState } from "react";
import { useToast, Toast } from "@/lib/store";
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info, Loader2 } from "lucide-react";

export function EduToaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed inset-0 z-[99999] pointer-events-none flex p-4">
      {/* Positions container */}
      {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((pos) => (
        <div
          key={pos}
          className={cn(
            "absolute flex flex-col gap-2.5 p-4 max-w-sm w-full",
            pos === 'top-left' ? 'top-0 left-0' :
              pos === 'top-right' ? 'top-0 right-0' :
                pos === 'bottom-left' ? 'bottom-0 left-0' : 'bottom-0 right-0'
          )}
        >
          {toasts.filter(t => (t.position || 'top-right') === pos).map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
          ))}
        </div>
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const [isClosing, setIsClosing] = useState(false);

  // Auto-dismiss logic respecting isSticky
  useEffect(() => {
    if (toast.type !== 'loading' && !toast.isSticky) {
      const duration = toast.duration || 3500;
      const timer = setTimeout(() => setIsClosing(true), duration);
      const closeTimer = setTimeout(() => onDismiss(toast.id), duration + 300);
      return () => {
        clearTimeout(timer);
        clearTimeout(closeTimer);
      };
    }
  }, [toast.isSticky, toast.type, toast.duration, toast.id, onDismiss]);

  const icons = {
    success: <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />,
    error: <AlertCircle size={18} className="text-destructive shrink-0" />,
    warning: <AlertTriangle size={18} className="text-amber-500 shrink-0" />,
    info: <Info size={18} className="text-primary shrink-0" />,
    loading: <Loader2 size={18} className="text-primary animate-spin shrink-0" />,
  };

  return (
    <div
      className={cn(
        "pointer-events-auto w-full p-3.5 rounded-lg shadow-lg flex items-center justify-between gap-3",
        "bg-card text-card-foreground border border-border backdrop-blur-md transition-all duration-200",
        isClosing && "animate-out slide-out-to-right-4 fade-out duration-300"
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        {icons[toast.type as keyof typeof icons] || icons.info}
        <p className="text-sm font-medium leading-snug truncate">{toast.message}</p>
      </div>

      {/* Close Button */}
      <button
        onClick={() => {
          setIsClosing(true);
          setTimeout(() => onDismiss(toast.id), 300);
        }}
        className="text-muted-foreground hover:text-foreground cursor-pointer rounded-md p-1 hover:bg-muted transition-colors shrink-0"
        aria-label="Dismiss toast"
      >
        <X size={15} />
      </button>
    </div>
  );
}

export default EduToaster;
