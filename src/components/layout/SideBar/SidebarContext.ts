"use client";

import { createContext } from "react";
import type { SidebarContextType } from "./SidebarTypes";

/**
 * ============================================================================
 * EduAsas Sidebar V2 - Context
 * ============================================================================
 *
 * React Context contract ya Sidebar V2.
 *
 * Majukumu (Responsibilities):
 * - Kutoa Sidebar state kwa components zilizo ndani ya mti wa UI.
 * - Kutoa Sidebar actions API.
 * - Kutoa safe fallback context wakati Provider haijapatikana.
 *
 * Haitawali (Non-responsibilities):
 * - Reducer logic.
 * - State mutations.
 * - UI rendering.
 *
 * @version 2.3.0
 */

/* ============================================================================
 * Safe Fallback Actions
 * ============================================================================
 */

/** No-operation function kwa ajili ya fallback actions */
const noop = (): void => {};

/* ============================================================================
 * Default Context State
 * ============================================================================
 */

export const defaultSidebarContext: SidebarContextType = {
  /* Core State */
  device: "desktop",
  variant: "docked",
  size: "expanded",
  isOpen: true,
  previousLayout: undefined, // Tablet restore memory
  hoverExpanded: false,
  animating: false,

  /* Device Helpers */
  isMobile: false,
  isTablet: false,
  isDesktop: true,

  /* Actions (Fallback Stubs) */
  setVariant: noop,
  setSize: noop,
  open: noop,
  close: noop,
  toggle: noop,
  setHoverExpanded: noop,
};

/* ============================================================================
 * React Context Definition
 * ============================================================================
 */

export const SidebarContext = createContext<SidebarContextType>(
  defaultSidebarContext
);