
import { ReactNode } from "react";
import { SidebarGroupSeparator } from "./SidebarGroupSeparator";
import { cn } from "@/lib/utils/helper";

/**
 * Props zinazohitajika na component ya `SidebarGroup`.
 */
interface SidebarGroupProps {
  /** Lebo au kichwa cha kundi la menyu (optional) */
  label?: string;
  /** Vipengele vya menyu vilivyopo ndani ya kundi hili */
  children: ReactNode;
  /** Inafafanua kama sidebar imekunjwa (collapsed) au la */
  collapsed?: boolean;
  /** CSS classes za ziada za Tailwind (optional) */
  className?: string;
}

/**
 * Component inayokusanya na kuweka vipengele vya menyu kwenye makundi (Groups).
 * 
 * Inaonyesha lebo ya kundi juu ikiwa ipo na pale tu ambapo sidebar haijakunjwa (`collapsed = false`).
 */
export function SidebarGroup({
  label,
  children,
  className,
}: SidebarGroupProps) {
  return (
    <section className={cn("space-y-2", className)}>
      <SidebarGroupSeparator title={label || "group"}/>
      <div className="space-y-1">{children}</div>
    </section>
  );
}