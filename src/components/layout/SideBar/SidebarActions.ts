/**
 * ============================================================================
 * EduAsas Sidebar V2 - Actions
 * ============================================================================
 *
 * Action creators za Sidebar V2.
 *
 * Faili hili linaficha implementation details za dispatch actions
 * kutoka kwenye UI components na kutoa interface iliyonyooka.
 *
 * @author EduAsas
 * @version 2.3.1
 */

import type { Dispatch } from "react";
import type { SidebarReducerAction } from "./SidebarReducer";
import type {
  SidebarDevice,
  SidebarSize,
  SidebarVariant,
} from "./SidebarTypes";

/* ============================================================================
 * Sidebar Action Creators
 * ========================================================================== */

/**
 * Fungua Sidebar.
 */
export function openSidebar(dispatch: Dispatch<SidebarReducerAction>): void {
  dispatch({ type: "OPEN" });
}

/**
 * Funga Sidebar.
 */
export function closeSidebar(dispatch: Dispatch<SidebarReducerAction>): void {
  dispatch({ type: "CLOSE" });
}

/**
 * Weka Layout (Size na Variant) kwa pamoja kulingana na Screen Rules.
 */
export function setSidebarLayout(
  dispatch: Dispatch<SidebarReducerAction>,
  size: SidebarSize,
  variant: SidebarVariant
): void {
  dispatch({
    type: "SET_LAYOUT",
    payload: { size, variant },
  });
}

/**
 * Rejesha Layout ya kifaa baada ya Resize au Breakpoint change.
 */
export function resetSidebarForDevice(
  dispatch: Dispatch<SidebarReducerAction>,
  payload: {
    device: SidebarDevice;
    size: SidebarSize;
    variant: SidebarVariant;
    isOpen: boolean;
  }
): void {
  dispatch({
    type: "RESET_FOR_DEVICE",
    payload,
  });
}

/**
 * Hifadhi layout ya sasa kabla ya kufanya temporary transition (k.m. kwenye Tablet).
 */
export function savePreviousSidebarLayout(
  dispatch: Dispatch<SidebarReducerAction>
): void {
  dispatch({ type: "SAVE_PREVIOUS_LAYOUT" });
}

/**
 * Rejesha layout ya nyuma (Restore State) baada ya kufunga floating panel.
 */
export function restorePreviousSidebarLayout(
  dispatch: Dispatch<SidebarReducerAction>
): void {
  dispatch({ type: "RESTORE_PREVIOUS" });
}

/**
 * Weka hover expansion state pale mtumiaji anapoweka mouse kwenye minimal sidebar.
 */
export function setSidebarHoverExpanded(
  dispatch: Dispatch<SidebarReducerAction>,
  expanded: boolean
): void {
  dispatch({
    type: "SET_HOVER_EXPANDED",
    payload: expanded,
  });
}