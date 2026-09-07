"use client";

import { cn } from "@/lib/utils/helper";
import { useEffect, useState } from "react";
import { useToast, Toast } from "@/lib/store";
import { X } from "lucide-react";

export function EduToaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed inset-0 z-[99999] pointer-events-none flex p-4">
      {/* Positions container */}
      {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((pos) => (
        <div
          key={pos}
          className={cn("absolute flex flex-col gap-3 p-4",
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

  // Auto-dismiss logic inahishimu isSticky
  useEffect(() => {
    if (toast.type !== 'loading' && !toast.isSticky) {
      const timer = setTimeout(() => setIsClosing(true), toast.duration || 3000);
      const closeTimer = setTimeout(() => onDismiss(toast.id), (toast.duration || 3000) + 300);
      return () => { clearTimeout(timer); clearTimeout(closeTimer); };
    }
  }, [toast.isSticky]);

  return (
    <div className={cn(
      "pointer-events-auto max-w-md trancate py-1.5 px-3 rounded-lg shadow-lg flex items-center justify-between gap-4",
      toast.type === "error" && "bg-red-700 text-red-50",
      toast.type === "success" && "bg-green-700 text-green-50",
      toast.type === "warning" && "bg-yellow-700 text-yellow-50",
      toast.type === "info" && "bg-blue-900 text-white",
      toast.type === "loading" && "bg-yellow-50 text-yellow-700",
      isClosing && "animate-out slide-out-to-right-4 fade-out"
    )}>
      <div className="flex items-center gap-3">
        {toast.type === 'loading' && <div className="animate-spin h-4 w-4 border-2 border-yellow-700 rounded-full border-t-transparent" />}
        <p className="text-base lg:text-sm font-medium">{toast.message}</p>
      </div>

      {/* Close Button */}
      <button
        onClick={() => { setIsClosing(true); setTimeout(() => onDismiss(toast.id), 300); }}
        className="text-slate-100 hover:text-white cursor-pointer rounded p-1 hover:bg-slate-100/30"
      >
        <span><X size={18} /></span>
      </button>
    </div>
  );
}