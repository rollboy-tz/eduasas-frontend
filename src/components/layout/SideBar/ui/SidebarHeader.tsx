"use client";

import { SidebarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { EduAsasLogo } from "@/components/elements";
import { useSidebar } from "../useSidebar";

interface SidebarHeaderProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

export function SidebarHeader({
  className,
}: SidebarHeaderProps) {
  const {
    size,
    isDesktop,
    isTablet,
    isMobile,
    variant,
    isOpen,
    setSize,
    open,
    close,
  } = useSidebar();

  const isMinimal = size === "minimal";

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

    // Mobile: toggle drawer visibility
    if (isMobile) {
      isOpen ? close() : open();
    }
  };

  return (
    <header
      className={cn(
        "group flex shrink-0 items-center py-3 transition-all duration-300 border-b border-border/40",
        isMinimal ? "justify-center px-2" : "justify-between px-4 gap-3",
        className
      )}
    >
      {isMinimal ? (
        /* When sidebar is minimal: show logo by default, toggle button on hover */
        <div className="flex items-center justify-center">
          <EduAsasLogo
            className="group-hover:hidden"
            titleHiden={true}
          />
          <button
            type="button"
            onClick={handleClick}
            className="hidden group-hover:flex items-center justify-center rounded-lg p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer duration-200"
            aria-label="Toggle Sidebar"
          >
            <SidebarIcon size={19} />
          </button>
        </div>
      ) : (
        /* Expanded state: show full brand and toggle icon side-by-side */
        <div className="w-full flex flex-col gap-3">
          <div className="flex items-center justify-between w-full">
            <EduAsasLogo
              titleClasses="font-heading font-bold text-foreground"
            />
            <button
              type="button"
              onClick={handleClick}
              className="rounded-lg p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer duration-200"
              aria-label="Toggle Sidebar"
            >
              <SidebarIcon size={19} />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

export default SidebarHeader;
