/**
 * @fileoverview Enterprise Global Confirmation Modal System
 * @author Injinia Rollboy (EduAsas Tech)
 * @version 3.0.0-Enterprise
 */

import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { AlertTriangle, Info } from "lucide-react";
import { Button, EduMainLoader } from "@/components/atoms";

/**
 * Options for the confirmation action button styling variant.
 */
export type ConfirmVariant = "danger" | "primary";

/**
 * Interface representing properties required to trigger the confirmation modal.
 */
export interface ConfirmProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

/**
 * @component AppConfirmModal
 * @description 
 * A global, event-driven enterprise confirmation dialog component. Listens to 
 * window custom events (`app:confirm`) to render safety prompts seamlessly anywhere in the app.
 */
export function AppConfirmModal() {
  const [data, setData] = useState<ConfirmProps | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Sikiliza tukio la kufungua modal na uwezeshe kitufe cha ESC kwenye keyboard
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
  }, [isLoading]);

  if (!data) return null;

  const handleCancel = () => {
    if (isLoading) return;
    if (data.onCancel) data.onCancel();
    setData(null);
  };

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
      className="fixed inset-0 z-[998] flex items-center justify-center bg-black/5 backdrop-blur-md p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white border border-slate-50 rounded-lg shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center justify-center gap-4">

          {/* Header */}
          <div className="w-full flex items-center gap-2">
            {/* Icon Badge kulingana na Variant */}

            <div className={cn(
              "p-2.5 rounded-full  shrink-0", variant === "danger" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700")}>
              {variant === "danger" ? (<AlertTriangle size={25} />) : (<Info size={25} />)}
            </div>

            <div className="flex-1">
              <h3 className="font-heading font-black text-lg text-zinc-900 tracking-tight">
                {data.title}
              </h3>

            </div>
          </div>

          {/* Body/Message */}
          <div className="py-1 mb-2">
            <p className="font-medium text-base md:text-sm text-slate-800">
              {data.message}
            </p>
          </div>

          <div className="w-full flex items-center justify-between md:justify-end gap-3 pt-2 border-t border-border/30">
            <Button
              onClick={handleCancel}
              disabled={isLoading}
              variant="secondary"
              className="flex-1 md:flex-none disabled:opacity-50 text-base font-semibold h-9"
            >
              {data.cancelLabel || "Cancel"}
            </Button>

            <Button
              onClick={handleConfirm}
              disabled={isLoading}
              variant={variant}
              className={cn(
                "flex-1 md:flex-none  h-9 inline-flex items-center justify-center gap-2 font-semibold text-base md:text-sm shadow-sm transition-all duration-200 disabled:opacity-50",
                variant === "danger"
              )}
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

/**
 * **showConfirm**
 * Triggers the global enterprise confirmation dialog from anywhere in the application.
 * 
 * @param {ConfirmProps} props - Configuration options for the modal (title, message, callbacks, variants).
 * 
 * @example
 * ```tsx
 * import { showConfirm } from "@/components/modals/AppConfirmModal";
 * 
 * const handleDeleteSchool = (schoolId: string) => {
 *   showConfirm({
 *     title: "DDelete school?",
 *     message: "Are you sure you want to delete this schoo?"
 *       // API call ya kufuta
 *       await api.deleteSchool(schoolId);
 *     }
 *   });
 * };
 * ```
 */
export const showConfirm = (props: ConfirmProps) => {
  window.dispatchEvent(
    new CustomEvent("app:confirm", { detail: props })
  );
};