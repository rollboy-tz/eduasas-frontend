
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { SIDEBAR_WIDTH } from "../SidebarRules";
import { useSidebar } from "../useSidebar";

/**
 * ============================================================================
 * EduAsas Sidebar V2 - Sidebar Shell
 * ============================================================================
 *
 * Container ya muonekano (Visual container) ya Sidebar V2.
 *
 * Majukumu (Responsibilities):
 * - Kuweka nafasi (Positioning) na kusimamia upana (Width handling).
 * - Ku-render muundo wa Docked au Floating kulingana na mazingira.
 * - Kusimamia mionekano ya responsive visibility na animations.
 *
 * Haitawali (Non-responsibilities):
 * - State mutations.
 * - Navigation logic au Permissions.
 *
 * @version 2.1.0
 */

interface SidebarShellProps {
  /** Maudhui yatakayokuwa ndani ya shell ya sidebar. */
  children: ReactNode;
  /** Custom Tailwind CSS classes. */
  className?: string;
}

export function SidebarShell({ children, className }: SidebarShellProps) {
  const { device, variant, size, isOpen } = useSidebar();

  const isDocked = variant === "docked";
  const isFloating = variant === "floating";

  const width =
    size === "expanded" ? SIDEBAR_WIDTH.expanded : SIDEBAR_WIDTH.minimal;

  const shouldHide = device === "mobile" && isFloating && !isOpen;

  return (
    <aside
      style={{ width }}
      className={cn(
        "z-50 flex flex-col bg-white backdrop-blur-xl",
        "transition-[width,transform] duration-300 ease-out",

        // Docked Mode Layout
        isDocked && "fixed left-0 inset-y-0 border-r border-border",

        // Floating Mode Layout
        isFloating && "fixed left-3 top-2 bottom-2 rounded-xl bg-white shadow-2xl",

        // Hide animation kwa ajili ya mobile drawer
        shouldHide && "-translate-x-[120%]",

        // Mobile responsiveness adjustment
        device === "mobile" && "max-w-[calc(100vw-32px)]",

        className
      )}
    >
      <div className="flex h-full min-h-0 flex-col">{children}</div>
    </aside>
  );
}