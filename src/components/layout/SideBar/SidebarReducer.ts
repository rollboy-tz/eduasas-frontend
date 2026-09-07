/**
 * ============================================================================
 * EduAsas Sidebar V2 - Reducer
 * ============================================================================
 *
 * Central state machine ya Sidebar V2.
 *
 * Inasimamia:
 * - Device transitions
 * - Responsive layout memory
 * - Open / close / toggle behavior
 * - Size + variant synchronization
 *
 * Reducer haina business decisions.
 * Provider ndiyo inaamua lini kubadilisha layout.
 *
 * @version 2.3.1
 */

import type {
  SidebarDevice,
  SidebarVariant,
  SidebarSize,
} from "./SidebarTypes";

/* ============================================================================
 * State Interface
 * ============================================================================
 */

export interface SidebarReducerState {
  device: SidebarDevice;
  variant: SidebarVariant;
  size: SidebarSize;
  isOpen: boolean;

  /**
   * Last stable layout.
   * Hutumika hasa wakati wa kurestore muonekano (e.g. Tablet restore).
   */
  previousSize: SidebarSize;
  previousVariant: SidebarVariant;
  previousOpen: boolean;

  hoverExpanded: boolean;
  animating: boolean;
}

/* ============================================================================
 * Action Types
 * ============================================================================
 */

export type SidebarReducerAction =
  | {
      type: "RESET_FOR_DEVICE";
      payload: {
        device: SidebarDevice;
        size: SidebarSize;
        variant: SidebarVariant;
        isOpen: boolean;
      };
    }
  /**
   * Badilisha au kugeuza hali ya Sidebar (Open <-> Close)
   */
  | {
      type: "TOGGLE";
    }
  /**
   * Change sidebar presentation size or variant.
   */
  | {
      type: "SET_LAYOUT";
      payload: {
        size: SidebarSize;
        variant: SidebarVariant;
      };
    }
  /**
   * Save current layout before temporary transition.
   */
  | {
      type: "SAVE_PREVIOUS_LAYOUT";
    }
  | {
      type: "OPEN";
    }
  | {
      type: "CLOSE";
    }
  | {
      type: "RESTORE_PREVIOUS";
    }
  | {
      type: "SET_HOVER_EXPANDED";
      payload: boolean;
    }
  | {
      type: "START_ANIMATION";
    }
  | {
      type: "STOP_ANIMATION";
    };

/* ============================================================================
 * Initial State
 * ============================================================================
 */

export const initialSidebarState: SidebarReducerState = {
  device: "desktop",
  variant: "docked",
  size: "expanded",
  isOpen: true,

  previousSize: "expanded",
  previousVariant: "docked",
  previousOpen: true,

  hoverExpanded: false,
  animating: false,
};

/* ============================================================================
 * Reducer Function
 * ============================================================================
 */

export function sidebarReducer(
  state: SidebarReducerState,
  action: SidebarReducerAction
): SidebarReducerState {
  switch (action.type) {
    /**
     * Device changed / Responsive Reset
     */
    case "RESET_FOR_DEVICE":
      return {
        ...state,
        device: action.payload.device,
        size: action.payload.size,
        variant: action.payload.variant,
        isOpen: action.payload.isOpen,

        previousSize: action.payload.size,
        previousVariant: action.payload.variant,
        previousOpen: action.payload.isOpen,

        hoverExpanded: false,
        animating: false,
      };

    /**
     * Toggle open/close state directly
     */
    case "TOGGLE":
      return {
        ...state,
        isOpen: !state.isOpen,
      };

    /**
     * Pure layout change.
     */
    case "SET_LAYOUT":
      return {
        ...state,
        size: action.payload.size,
        variant: action.payload.variant,
      };

    /**
     * Store current stable layout.
     */
    case "SAVE_PREVIOUS_LAYOUT":
      return {
        ...state,
        previousSize: state.size,
        previousVariant: state.variant,
        previousOpen: state.isOpen,
      };

    /**
     * Open explicitly.
     */
    case "OPEN":
      return {
        ...state,
        isOpen: true,
      };

    /**
     * Close explicitly.
     */
    case "CLOSE":
      return {
        ...state,
        isOpen: false,
      };

    /**
     * Restore previous saved layout.
     */
    case "RESTORE_PREVIOUS":
      return {
        ...state,
        size: state.previousSize,
        variant: state.previousVariant,
        isOpen: state.previousOpen,
      };

    case "SET_HOVER_EXPANDED":
      return {
        ...state,
        hoverExpanded: action.payload,
      };

    case "START_ANIMATION":
      return {
        ...state,
        animating: true,
      };

    case "STOP_ANIMATION":
      return {
        ...state,
        animating: false,
      };

    default:
      return state;
  }
}