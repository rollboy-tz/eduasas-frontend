import React, { useState, useEffect } from "react";
import { X, AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils/helper";
import { Button } from "../atoms";

export type FeedbackType = "success" | "error" | "warning";

export interface FeedbackAction {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger";
}

export interface FeedbackProps {
  type: FeedbackType;
  title?: string;
  message: string;
  isStrict?: boolean;
  actions?: FeedbackAction[];
}

export function AppFeedbackModal() {
  const [data, setData] = useState<FeedbackProps | null>(null);

  useEffect(() => {
    const handleEvent = (e: CustomEvent<FeedbackProps>) => setData(e.detail);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!data) return;
      if (e.key === "Escape" && !data.isStrict) {
        setData(null);
      }
    };

    window.addEventListener("app:feedback", handleEvent as EventListener);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("app:feedback", handleEvent as EventListener);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [data]);

  if (!data) return null;

  const resolveContent = () => {
    if (data.message && data.message.includes(":")) {
      const [extractedTitle, ...rest] = data.message.split(":");
      return {
        title: extractedTitle.trim(),
        message: rest.join(":").trim()
      };
    }

    if (data.title) return { title: data.title, message: data.message };

    const defaults = {
      error: "Notice",
      success: "Process Completed",
      warning: "Attention Required"
    };

    return { title: defaults[data.type], message: data.message };
  };

  const { title, message } = resolveContent();

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !data.isStrict) {
      setData(null);
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md min-w-xs overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-2xl animate-in zoom-in-95 duration-200">

        {/* Close Button */}
        {!data.isStrict && (
          <button
            onClick={() => setData(null)}
            type="button"
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground transition-colors hover:bg-muted cursor-pointer"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        )}

        <div className="p-5">
          <div className="flex flex-col items-start gap-3">

            {/* Header */}
            <div className="flex items-center gap-3 w-full pr-6">
              <div
                className={cn(
                  "flex p-2 shrink-0 items-center justify-center rounded-lg",
                  data.type === "success" && "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
                  data.type === "error" && "bg-destructive/15 text-destructive",
                  data.type === "warning" && "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                )}
              >
                {data.type === "success" && <CheckCircle2 size={22} strokeWidth={2.2} />}
                {data.type === "error" && <AlertCircle size={22} strokeWidth={2.2} />}
                {data.type === "warning" && <AlertTriangle size={22} strokeWidth={2.2} />}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="font-heading text-base font-bold tracking-tight text-foreground truncate">
                  {title}
                </h3>
              </div>
            </div>

            {/* Separator */}
            <div className="w-full bg-border/60 h-[1px]" />

            {/* Body/Message */}
            <div className="w-full py-1">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {message}
              </p>
            </div>

            {/* Action Buttons Footer */}
            {data.actions && data.actions.length > 0 && (
              <>
                <div className="w-full bg-border/60 h-[1px] mt-1" />

                <div className={cn(
                  "w-full flex items-center justify-end gap-3 pt-1",
                  data.actions.length > 1 ? "justify-center sm:justify-end" : ""
                )}>
                  {data.actions.map((act, i) => (
                    <Button
                      key={i}
                      variant={act.variant}
                      size="md"
                      onClick={() => {
                        act.onClick();
                        setData(null);
                      }}
                      className={cn(
                        "text-sm h-9",
                        data.actions && data.actions.length > 1 ? "flex-1 sm:flex-none" : "min-w-28"
                      )}
                    >
                      {act.label}
                    </Button>
                  ))}
                </div>
              </>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}

export const showFeedback = (props: FeedbackProps) => {
  window.dispatchEvent(
    new CustomEvent("app:feedback", { detail: props })
  );
};

export default AppFeedbackModal;
