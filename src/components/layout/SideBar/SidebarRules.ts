/**
 * ============================================================================
 * EduAsas Sidebar V2 - Rules
 * ============================================================================
 *
 * Source of truth ya Sidebar V2 behavior.
 *
 * Rules zinategemea:
 * - Device type (desktop, tablet, mobile)
 * - Sidebar Size (expanded, minimal)
 * - Variant resolution (docked, floating)
 *
 * Provider na UI hazitunzi business logic.
 *
 * @author EduAsas
 * @version 2.1.0
 */

import type {
  SidebarDevice,
  SidebarVariant,
  SidebarSize,
} from "./SidebarTypes";

/* ============================================================================
 * Width Constants
 * ============================================================================
 */

export const SIDEBAR_WIDTH = {
  expanded: 230,
  minimal: 50,
} as const;

/* ============================================================================
 * Device Rules Interface & Definitions
 * ============================================================================
 */

export interface SidebarDeviceRule {
  defaultVariant: SidebarVariant;
  defaultSize: SidebarSize;
  defaultOpen: boolean;
  allowedVariants: readonly SidebarVariant[];
  allowedSizes: readonly SidebarSize[];
}

/**
 * Sidebar behavior source of truth.
 */
export const SIDEBAR_RULES: Record<SidebarDevice, SidebarDeviceRule> = {
  /**
   * Desktop: Sidebar always occupies layout space.
   */
  desktop: {
    defaultVariant: "docked",
    defaultSize: "expanded",
    defaultOpen: true,
    allowedVariants: ["docked"],
    allowedSizes: ["expanded", "minimal"],
  },

  /**
   * Tablet:
   * Minimal -> docked
   * Expanded -> floating
   */
  tablet: {
    defaultVariant: "docked",
    defaultSize: "minimal",
    defaultOpen: true,
    allowedVariants: ["docked", "floating"],
    allowedSizes: ["minimal", "expanded"],
  },

  /**
   * Mobile: Drawer only.
   */
  mobile: {
    defaultVariant: "floating",
    defaultSize: "expanded",
    defaultOpen: false,
    allowedVariants: ["floating"],
    allowedSizes: ["expanded"],
  },
} as const;

/* ============================================================================
 * Rule Resolvers & Helpers
 * ============================================================================
 */

/**
 * Pata rules kamili za kifaa husika.
 */
export function getSidebarRules(device: SidebarDevice): SidebarDeviceRule {
  return SIDEBAR_RULES[device];
}

/**
 * Pata size ya msingi (default) ya kifaa.
 */
export function resolveSidebarSize(device: SidebarDevice): SidebarSize {
  return SIDEBAR_RULES[device].defaultSize;
}

/**
 * Resolve variant kulingana na device + size.
 * HII NDIYO LOGIC KUU YA ADAPTIVE SIDEBAR.
 */
export function resolveSidebarVariant(
  device: SidebarDevice,
  size: SidebarSize
): SidebarVariant {
  switch (device) {
    case "mobile":
      return "floating";

    case "tablet":
      return size === "expanded" ? "floating" : "docked";

    case "desktop":
    default:
      return "docked";
  }
}

/**
 * Angalia kama size iliyochaguliwa inaruhusiwa kwenye kifaa hiki.
 */
export function isSizeAllowed(
  device: SidebarDevice,
  size: SidebarSize
): boolean {
  return (SIDEBAR_RULES[device].allowedSizes as readonly string[]).includes(size);
}

/**
 * Angalia kama variant iliyochaguliwa inaruhusiwa kwenye kifaa hiki.
 */
export function isVariantAllowed(
  device: SidebarDevice,
  variant: SidebarVariant
): boolean {
  return (SIDEBAR_RULES[device].allowedVariants as readonly string[]).includes(variant);
}

/**
 * Resolve state kamili baada ya kubadilisha size au device.
 */
export function resolveSidebarState(
  device: SidebarDevice,
  size: SidebarSize
) {
  return {
    device,
    size,
    variant: resolveSidebarVariant(device, size),
  };
}

/**
 * Inakagua kama Sidebar inatakiwa isukume (push) main content.
 *
 * Push:
 * - Desktop docked
 * - Tablet minimal docked
 *
 * Overlay:
 * - Floating sidebar
 * - Mobile drawer
 */
export function shouldPushContent(
  device: SidebarDevice,
  //size: SidebarSize,
  variant: SidebarVariant
): boolean {
  // Floating haiwezi kusukuma content
  if (variant === "floating") {
    return false;
  }

  // Mobile ni drawer kila wakati
  if (device === "mobile") {
    return false;
  }

  // Docked desktop/tablet minimal inashikilia nafasi
  return true;
}

/**
 * Pata urefu wa Pixels kulingana na size (expanded au minimal).
 */
export function getSidebarWidth(size: SidebarSize): number {
  return SIDEBAR_WIDTH[size];
}