/**
 * @file EduButton.tsx
 * @description Reusable EduAsas Button Component with support for icons, sizes, loading states, and variants.
 */

import { EduMainLoader } from "@/components/atoms";
import { Button } from "@/components/atoms";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";

export interface EduButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children?: React.ReactNode;
    icon?: LucideIcon;
    iconPosition?: "left" | "right";
    disabled?: boolean;
    isLoading?: boolean;
    loadingText?: string;
    size?: "sm" | "md" | "lg";
    variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
    className?: string;
}

export const EduButton = React.forwardRef<HTMLButtonElement, EduButtonProps>(
    ({ 
        children,
        icon: Icon,
        disabled,
        isLoading,
        loadingText,
        iconPosition = "left",
        size = "md",
        className,
        variant = "primary",
        ...props 
    }, ref) => {

        // Vyombo vya vipimo vya button kulingana na size
        const sizeClasses = {
            sm: "h-8 px-3 text-xs",
            md: "h-10 px-4 text-sm",
            lg: "h-11 px-6 text-base"
        };

        // Zuia kubonyeza kama iko disabled au inaload
        const isDisabled = disabled || isLoading;

        return (
            <Button
                ref={ref}
                variant={variant}
                disabled={isDisabled}
                className={cn(
                    "inline-flex items-center justify-center cursor-pointer",
                    "disabled:opacity-60 disabled:cursor-not-allowed",
                    // Mwelekeo wa icon (Kushoto au Kulia)
                    iconPosition === "right" ? "flex-row-reverse gap-2" : "flex-row gap-2",
                    sizeClasses[size],
                    className
                )} 
                {...props}
            >
                {isLoading ? (
                    <>
                        <EduMainLoader size={15} />
                        <span>{loadingText || children}</span>
                    </>
                ) : (
                    <>
                        {Icon && <Icon className="w-4 h-4 shrink-0" />}
                        <span>{children}</span>
                    </>
                )}
            </Button>
        );
    }
);

EduButton.displayName = "EduButton";