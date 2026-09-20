"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/helper";

interface EduMainModalProps {
  isOpen: boolean;
  onClose?: () => void;
  isLoading?: boolean;
  title?: string;
  titleClassName?: string;
  children: React.ReactNode;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "1xl" | "2xl" | "3xl" | "4xl" | "5xl";
  className?: string;
}

export function EduMainModal({
  isOpen,
  onClose,
  isLoading = false,
  title,
  children,
  size = "lg",
  className,
  titleClassName
}: EduMainModalProps) {

  const sizeClasses = {
    xs: "max-w-xs",
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "1xl": "max-w-1xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl"
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 sm:p-6">

          {/* 1. Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 backdrop-blur-xs bg-black/40"
          />

          {/* 2. Main Modal Container */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "relative w-full",
              sizeClasses[size],
              "border border-border rounded-xl bg-card text-card-foreground shadow-2xl overflow-hidden",
              className
            )}
          >
            {/* Title & Close button area */}
            {title ? (
              <div className="flex items-center justify-between p-4 border-b border-border/50">
                <h3 className={cn("text-lg font-bold tracking-tight text-foreground", titleClassName)}>{title}</h3>
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              // Close button when no title
              <div className="absolute top-4 right-4 z-[60]">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="p-1.5 rounded-lg bg-card/80 border border-border/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            {/* Content wrapper */}
            {children}

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default EduMainModal;
