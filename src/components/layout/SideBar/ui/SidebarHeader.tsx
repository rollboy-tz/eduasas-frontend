"use client";

import { SidebarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { EduAsasLogo } from "@/components/elements";
import { useSidebar } from "../useSidebar";

/**
 * ============================================================================
 * EduAsas Sidebar V2 - Sidebar Header
 * ============================================================================
 *
 * Header ya Sidebar.
 *
 * Majukumu (Responsibilities):
 * - Brand presentation & Workspace identity.
 * - Responsive appearance handling.
 *
 * Haitawali (Non-responsibilities):
 * - Sidebar state mutation directly (uses hook actions instead).
 * - Navigation & Permissions logic.
 *
 * @version 2.2.0
 */

interface SidebarHeaderProps {
  /** Brand title. */
  title?: string;
  /** Optional subtitle. */
  subtitle?: string;
  /** Custom Tailwind CSS classes. */
  className?: string;
}

export function SidebarHeader({
  // title,
  // subtitle,
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
        "group flex shrink-0 items-center py-2 transition-all duration-300",
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
            className="hidden group-hover:flex items-center justify-center rounded-md p-1 hover:bg-muted-200 transition-all cursor-pointer duration-300"
            aria-label="Toggle Sidebar"
          >
            <SidebarIcon size={19} className="text-muted-800" />
          </button>
        </div>
      ) : (
        /* Expanded state: show full brand and toggle icon side-by-side */
        <div className="flex items-center justify-between w-full">
          <EduAsasLogo
            titleClasses="font-heading font-black"
          />
          <button
            type="button"
            onClick={handleClick}
            className="rounded-md p-1 hover:bg-muted-200 transition-all cursor-pointer duration-300"
            aria-label="Toggle Sidebar"
          >
            <SidebarIcon size={19} className="text-muted-800" />
          </button>
        </div>
      )}
    </header>
  );
}