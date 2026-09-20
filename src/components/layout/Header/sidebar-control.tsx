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
    // Desktop: toggle between expanded <-> minimal
    if (isDesktop) {
      setSize(size === "expanded" ? "minimal" : "expanded");
      return;
    }

    // Tablet: toggle between docked/floating states
    if (isTablet) {
      if (variant === "floating") {
        close();
      } else {
        open();
      }
      return;
    }

    // Mobile: toggle drawer
    if (isMobile) {
      isOpen ? close() : open();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Toggle sidebar"
      className={cn(
        "flex h-9 w-9 md:h-9 md:w-9 min-h-[44px] min-w-[44px] md:min-h-[36px] md:min-w-[36px] items-center justify-center",
        "rounded-lg border border-border/50 md:border-transparent",
        "text-muted-foreground hover:text-foreground hover:bg-muted/70",
        "transition-all duration-200 active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      )}
    >
      <PanelLeft
        className={cn(
          "h-5 w-5 transition-transform duration-300",
          isDesktop && size === "minimal" && "rotate-180",
          isTablet && variant === "floating" && "text-primary",
          isMobile && isOpen && "text-primary"
        )}
      />
    </button>
  );
}

export default SidebarControl;
