"use client";

import { useSidebar } from "../context";
import { SIDEBAR_WIDTH } from "../constants";
import { cn } from "@/lib/utils";

interface SidebarShellProps {
  children: React.ReactNode;
  className?: string;
}

export function SidebarShell({ children, className }: SidebarShellProps) {
  const { device, variant, size, isOpen } = useSidebar();

  const isDocked = variant === "docked";
  const isFloating = variant === "floating";

  const sWidth = size === "expanded" ? SIDEBAR_WIDTH.expanded : SIDEBAR_WIDTH.minimal;
  const width = isFloating ? sWidth + 40 : sWidth;
  const shouldHide = device === "mobile" && isFloating && !isOpen;

  return (
    <aside
      style={{ width }}
      className={cn(
        "z-50 flex flex-col bg-card text-card-foreground",
        "transition-[width,transform] duration-300 ease-out",

        // Docked Mode Layout
        isDocked && "fixed left-0 inset-y-0 border-r border-border bg-card/95 backdrop-blur-md",

        // Floating Mode Layout
        isFloating && "fixed left-3 top-2 bottom-2 rounded-xl bg-card/95 border border-border shadow-xl backdrop-blur-md",

        // Mobile drawer slide-out animation
        shouldHide && "-translate-x-[120%]",

        // Mobile responsiveness adjustment
        device === "mobile" && "max-w-[calc(100vw-32px)] shadow-2xl",

        className
      )}
    >
      <div className="flex h-full min-h-0 flex-col">{children}</div>
    </aside>
  );
}

export default SidebarShell;
