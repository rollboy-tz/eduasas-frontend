
import { cn } from "@/lib/utils";
import { useSidebar } from "../useSidebar";

/**
 * ============================================================================
 * EduAsas Sidebar V2 - Sidebar Overlay
 * ============================================================================
 *
 * Overlay layer kwa ajili ya floating mode kwenye Sidebar.
 *
 * Majukumu (Responsibilities):
 * - Kufunika content ya nyuma wakati floating sidebar iko wazi.
 * - Kutoa blur effect nyepesi na mtindo wa kisasa (Minimal Apple Style).
 * - Kuruhusu kufunga (close) sidebar pale mtumiaji anapobonyeza nje.
 *
 * Haitawali (Non-responsibilities):
 * - Sidebar state au Device detection (Inasimamiwa na Sidebar Provider).
 *
 * @version 2.0.0
 */

interface SidebarOverlayProps {
  /** Custom Tailwind CSS classes. */
  className?: string;
}

export function SidebarOverlay({ className }: SidebarOverlayProps) {
  const { isOpen, variant, isMobile, isTablet, close } = useSidebar();

  // Overlay inahitajika tu kwa floating sidebar kwenye simu au tablet
  const shouldShow = isOpen && variant === "floating" && (isMobile || isTablet);

  if (!shouldShow) {
    return null;
  }

  return (
    <button
      type="button"
      aria-label="Close sidebar overlay"
      onClick={close}
      className={cn(
        "fixed inset-0 z-50",
        "bg-black/5 backdrop-blur-md",
        "transition-opacity duration-300",
        className
      )}
    />
  );
}