
import React from "react";
import { HelpCircle } from "lucide-react";

import { cn } from "@/lib/utils/helper";

/**
 * Props zinazohitajika na component ya `SidebarIcon`.
 */
interface SidebarIconProps {
  /** React Component ya ikoni inayotakiwa kuonyeshwa (optional) */
  component?: React.ElementType;
  /** CSS classes za ziada za Tailwind (optional) */
  className?: string;
  /** Ukubwa wa ikoni kwa pixels (default: 20) */
  size?: number;
  /**Rangi ya */
  fill?: string;
}

/**
 * Component ndogo inayoweka na kuonyesha ikoni ya menyu.
 * 
 * Ikiwa hakuna `component` iliyotolewa, itatumia ikoni ya msingi (`HelpCircle`).
 */
export function SidebarIcon({
  component: Icon,
  className,
  size = 20,
  fill = ""
}: SidebarIconProps) {
  const IconComponent = Icon || HelpCircle;

  return (
    <IconComponent
      size={size}
      fill={fill || "none"}
      className={cn("shrink-0", className)}
    />
  );
}