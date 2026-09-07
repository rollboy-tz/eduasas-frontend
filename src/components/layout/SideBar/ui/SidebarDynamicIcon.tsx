
import type { ElementType } from "react";
import * as Icons from "lucide-react";

/**
 * ============================================================================
 * EduAsas Sidebar V2 - Dynamic Icon
 * ============================================================================
 *
 * Dynamic icon renderer kwa ajili ya Sidebar menu configuration.
 *
 * Majukumu (Responsibilities):
 * - Kupokea jina la icon kama string.
 * - Ku-render icon husika kutoka `lucide-react`.
 * - Kutoa fallback icon (`HelpCircle`) ikiwa jina lililopitishwa halipo.
 *
 * Haina (Non-responsibilities):
 * - Sidebar state management
 * - Context dependency
 * - Navigation logic
 *
 * @version 2.2.0
 */

interface SidebarDynamicIconProps {
  /** Jina la icon kutoka `lucide-react` (Mfano: "Home", "Users", "Settings"). */
  name: string;
  /** Ukubwa wa icon (Default: 20). */
  size?: number;
  /** Madarasa ya Tailwind CSS kwa ajili ya styling. */
  className?: string;
  /** Unene wa stroke ya icon (Default: 2). */
  strokeWidth?: number;
}

export function SidebarDynamicIcon({
  name,
  size = 20,
  className,
  strokeWidth = 2,
}: SidebarDynamicIconProps) {
  // Chukua IconComponent kwa usalama kutoka kwenye Lucide Icons
  const iconsMap = Icons as unknown as Record<string, ElementType | undefined>;
  const IconComponent = iconsMap[name];

  // Tumia HelpCircle kama fallback ikiwa jina la icon halikupatikana
  const Icon = IconComponent ?? Icons.HelpCircle;

  return (
    <Icon
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      aria-hidden="true"
    />
  );
}