/**
 * @fileoverview Enterprise Global Feedback Modal System
 * @author Injinia Rollboy (EduAsas Tech)
 * @version 2.0.0-Enterprise
 */

import React, { useState, useEffect } from "react";
import { X, AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils/helper";
import { Button } from "../atoms";

/**
 * Types of feedback notification categories.
 */
export type FeedbackType = "success" | "error" | "warning";

/**
 * Interface representing interactive action buttons inside the feedback modal.
 */
export interface FeedbackAction {
    /** Button label text. */
    label: string;

    /** Callback function executed when the action button is clicked. */
    onClick: () => void;

    /** Visual style variant for the action button. */
    variant?: "primary" | "secondary" | "danger";
}

/**
 * Properties required to trigger the feedback modal.
 */
export interface FeedbackProps {
    /** The feedback severity category type. */
    type: FeedbackType;

    /** Optional explicit title. If omitted, it auto-extracts from message or defaults. */
    title?: string;

    /** Main message text. Can include a colon (e.g. "Access Denied: You cannot view this"). */
    message: string;

    /** If true, the close button and backdrop click are disabled, forcing user interaction. */
    isStrict?: boolean;

    /** Optional array of action buttons displayed at the footer. */
    actions?: FeedbackAction[];
}

/**
 * @component AppFeedbackModal
 * @description 
 * A global, event-driven enterprise feedback modal component. Listens to 
 * window custom events (`app:feedback`) to render status alerts, errors, and warnings seamlessly.
 */
export function AppFeedbackModal() {
    const [data, setData] = useState<FeedbackProps | null>(null);

    useEffect(() => {
        const handleEvent = (e: CustomEvent<FeedbackProps>) => setData(e.detail);

        const handleKeyDown = (e: KeyboardEvent) => {
            if (!data) return;

            // Funga modal kwa kutumia kitufe cha ESC kama sio strict
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

    /**
     * Intelligent text resolver that parses titles from colon-separated messages 
     * or assigns appropriate defaults based on the feedback type.
     */
    const resolveContent = () => {
        if (data.title) return { title: data.title, message: data.message };

        if (data.message && data.message.includes(":")) {
            const [extractedTitle, ...rest] = data.message.split(":");
            return {
                title: extractedTitle.trim(),
                message: rest.join(":").trim()
            };
        }

        const defaults = {
            error: "Ohh! Sorry!",
            success: "Process completed",
            warning: "Continue carefully!"
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
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/5 backdrop-blur-md p-4 animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
        >
            <div className="relative w-full max-w-md min-w-xs overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 backdrop-blur-xl">

                {/* Close Button */}
                {!data.isStrict && (
                    <button
                        onClick={() => setData(null)}
                        type="button"
                        className="absolute right-4 top-5 flex h-8 w-8 items-center justify-center rounded-md text-slate-800 transition-all hover:bg-slate-200 cursor-pointer"
                        aria-label="Close modal"
                    >
                        <X size={16} />
                    </button>
                )}

                <div className="p-5">
                    <div className="flex flex-col items-start gap-2">

                        {/* Header */}
                        <div className="flex items-center gap-2">
                            <div
                                className={cn(
                                    "flex p-1.5 shrink-0 items-center justify-center rounded-lg",
                                    data.type === "success" && "bg-emerald-100 text-emerald-700",
                                    data.type === "error" && "bg-red-100 text-red-700",
                                    data.type === "warning" && "bg-amber-100 text-amber-700"
                                )}
                            >
                                {data.type === "success" && <CheckCircle2 size={24} strokeWidth={2.2} />}
                                {data.type === "error" && <AlertCircle size={24} strokeWidth={2.2} />}
                                {data.type === "warning" && <AlertTriangle size={24} strokeWidth={2.2} />}
                            </div>

                            <div className="min-w-0 flex-1 pr-4">
                                <h3 className="font-heading text-lg font-bold tracking-tight text-zinc-900 trancate">
                                    {title}
                                </h3>

                            </div>
                        </div>

                        {/* Separator */}
                        <div className="w-full flex bg-slate-100 h-[1px]" />

                        {/* Body/Message */}
                        <div className="w-full mt-1 mb-5 px-2">
                            <p className="text-base md:text-sm font-medium text-slate-800">
                                {message}
                            </p>
                        </div>

                        {/* Action Buttons Footer */}
                        {data.actions && data.actions.length > 0 && (
                            <>
                                <div className="w-full flex bg-slate-100 h-[1px]" />

                                <div className={cn(
                                    "w-full flex items-center justify-end gap-3 px-2",
                                    data.actions.length > 1 ? "justify-center md:justify-end " : ""
                                   )}>
                                    {data.actions.map((act, i) => (
                                        <Button
                                            key={i}
                                            variant={act.variant}
                                            size="sm"
                                            onClick={() => {
                                                act.onClick();
                                                setData(null);
                                            }}
                                            className={cn(
                                                "text-base h-9",
                                                data.actions && data.actions.length > 1 ? "flex-1 md:flex-none" : "min-w-30"
                                            )}

                                        > {act.label} </Button>
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

/**
 * 🚀 **showFeedback**
 * Triggers the global enterprise feedback modal from anywhere in the application.
 * 
 * @param {FeedbackProps} props - Configuration options for the feedback prompt.
 * 
 * @example
 * import { showFeedback } from "@/components/showFeedback";
 * 
 * try {
 * 
 *   await api.updateSchool(data);
 * 
 *   showFeedback({
 *     type: "success",
 *     message: "Successed: Data saved successfully.",
 *     actions: [{ label: "Ok", onClick: () => {} }]
 *   });
 * 
 * } catch (error: any) {
 * 
 *   showFeedback({
 *     type: "error",
 *     message: error.message || "Unable to save the details.",
 *     actions: [{ label: "Retry", onClick: () => handleRetry() }]
 *   });
 * }
 */
export const showFeedback = (props: FeedbackProps) => {
    window.dispatchEvent(
        new CustomEvent("app:feedback", { detail: props })
    );
};