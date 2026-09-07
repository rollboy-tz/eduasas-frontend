"use client";

import { PanelLeft } from "lucide-react";

import { cn } from "@/lib/utils";
import { useSidebar } from "../SideBar";

export function SidebarControl() {
    const {
        isDesktop,
        isTablet,
        isMobile,

        size,
        variant,
        isOpen,

        setSize,
        open,
        close,
    } = useSidebar();

    const handleClick = () => {

        /**
         * Desktop
         *
         * expanded <-> minimal
         */
        if (isDesktop) {
            setSize(
                size === "expanded"
                    ? "minimal"
                    : "expanded"
            );

            return;
        }

        /**
         * Tablet
         *
         * docked -> floating
         * floating -> restore
         */
        if (isTablet) {
            if (variant === "floating") {
                close();
            } else {
                open();
            }

            return;
        }

        /**
         * Mobile
         *
         * drawer
         */
        if (isMobile) {
            isOpen
                ? close()
                : open();
        }
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            aria-label="Toggle sidebar"
            className={cn(
                "flex h-9 w-9 items-center justify-center",
                "rounded-xl",
                "transition-all duration-200",
                "hover:bg-muted/70",
                "active:scale-95"
            )}
        >
            <PanelLeft
                className={cn(
                    "h-5 w-5 transition-transform duration-300",

                    isDesktop &&
                        size === "minimal" &&
                        "rotate-180",

                    isTablet &&
                        variant === "floating" &&
                        "text-primary",

                    isMobile &&
                        isOpen &&
                        "text-primary"
                )}
            />
        </button>
    );
}