import { cn } from "@/lib/utils";
import { useState, useEffect, useCallback } from "react";
import { AlertTriangle, Info } from "lucide-react";
import { Button, EduMainLoader } from "@/components/atoms";

export type ConfirmVariant = "danger" | "primary";

export interface ConfirmProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

export function AppConfirmModal() {
  const [data, setData] = useState<ConfirmProps | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCancel = useCallback(() => {
    if (isLoading) return;
    if (data?.onCancel) data.onCancel();
    setData(null);
  }, [isLoading, data]);

  useEffect(() => {
    const handleEvent = (e: CustomEvent<ConfirmProps>) => {
      setData(e.detail);
      setIsLoading(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        handleCancel();
      }
    };

    window.addEventListener("app:confirm", handleEvent as EventListener);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("app:confirm", handleEvent as EventListener);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLoading, handleCancel]);

  if (!data) return null;

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      await data.onConfirm();
      setData(null);
    } catch (error) {
      console.error("Confirm action execution failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const variant = data.variant || "danger";

  return (
    <div
      className="fixed inset-0 z-[998] flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-card text-card-foreground border border-border rounded-xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center justify-center gap-4">

          {/* Header */}
          <div className="w-full flex items-center gap-3">
            <div className={cn(
              "p-2.5 rounded-full shrink-0",
              variant === "danger"
                ? "bg-destructive/15 text-destructive"
                : "bg-primary/15 text-primary"
            )}>
              {variant === "danger" ? <AlertTriangle size={22} /> : <Info size={22} />}
            </div>

            <div className="flex-1">
              <h3 className="font-heading font-bold text-lg text-foreground tracking-tight">
                {data.title}
              </h3>
            </div>
          </div>

          {/* Body/Message */}
          <div className="w-full py-1">
            <p className="font-normal text-sm text-muted-foreground leading-relaxed">
              {data.message}
            </p>
          </div>

          {/* Footer Actions */}
          <div className="w-full flex items-center justify-between sm:justify-end gap-3 pt-3 border-t border-border/50">
            <Button
              onClick={handleCancel}
              disabled={isLoading}
              variant="secondary"
              className="flex-1 sm:flex-none text-sm font-semibold h-9"
            >
              {data.cancelLabel || "Cancel"}
            </Button>

            <Button
              onClick={handleConfirm}
              disabled={isLoading}
              variant={variant}
              className="flex-1 sm:flex-none h-9 inline-flex items-center justify-center gap-2 font-semibold text-sm shadow-xs"
            >
              {isLoading && <EduMainLoader size={16} />}
              {data.confirmLabel || "Confirm"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export const showConfirm = (props: ConfirmProps) => {
  window.dispatchEvent(
    new CustomEvent("app:confirm", { detail: props })
  );
};

export default AppConfirmModal;
