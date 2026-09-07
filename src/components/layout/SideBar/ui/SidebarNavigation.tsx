
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useSidebar } from "../useSidebar";

/**
 * ============================================================================
 * EduAsas Sidebar V2 - Sidebar Navigation
 * ============================================================================
 *
 * Container kuu ya eneo la Sidebar Navigation.
 *
 * Majukumu (Responsibilities):
 * - Kushikilia vikundi vya menyu za sidebar (Sidebar groups).
 * - Kusimamia mianya ya wima (Vertical spacing).
 * - Kusimamia mienendo ya kuteleza (Scroll behavior).
 * - Responsive padding kulingana na ukubwa wa sidebar (Sidebar size).
 *
 * Haitawali (Non-responsibilities):
 * - Menu data au Active state logic.
 * - Navigation Routing au Permissions.
 * - Sidebar state mutations.
 *
 * @version 2.3.0
 */

interface SidebarNavigationProps {
  /** Navigation content (menu items, groups, etc.). */
  children: ReactNode;
  /** Extra Tailwind CSS classes. */
  className?: string;
}

export function SidebarNavigation({
  children,
  className,
}: SidebarNavigationProps) {
  const { size } = useSidebar();
  const isMinimal = size === "minimal";

  return (
    <nav
      className={cn(
        // Layout & Flexbox
        "flex flex-1 min-h-0 flex-col",

        // Scroll Behavior
        "overflow-y-auto overscroll-contain custom-scrollbar",

        // Dynamic Padding based on size state
        isMinimal ? "px-2 py-3 gap-2" : "px-3 py-4 gap-3",

        // Smooth Transitions
        "transition-[padding] duration-300 ease-out",

        className
      )}
    >
      {children}
    </nav>
  );
}