/**
 * ============================================================================
 * EduAsas Sidebar V2 - Provider
 * ============================================================================
 *
 * Provider kuu ya Sidebar V2.
 *
 * Responsibilities:
 * - Kusimamia reducer state.
 * - Kutambua device (Mobile, Tablet, Desktop).
 * - Ku-resolve responsive behavior kulingana na rules.
 * - Kutoa Context API kwa ajili ya sub-components.
 *
 * Provider ndiyo inaamua:
 * - Desktop behavior (always docked layout)
 * - Tablet restore behavior (minimal docked <-> expanded floating)
 * - Mobile drawer behavior (floating overlay)
 *
 * @author EduAsas
 * @version 2.3.1
 */

"use client";

import { useEffect, useMemo, useReducer, useRef } from "react";
import { SidebarContext } from "./SidebarContext";
import { sidebarReducer, initialSidebarState } from "./SidebarReducer";
import {
  getSidebarRules,
  isSizeAllowed,
  isVariantAllowed,
  resolveSidebarVariant,
} from "./SidebarRules";

import type {
  SidebarContextType,
  SidebarDevice,
  SidebarProviderProps,
} from "./SidebarTypes";

/* ============================================================================
 * Device Detector Helper
 * ============================================================================
 */

/**
 * Inakagua na kurudisha aina ya kifaa (device) kulingana na window width.
 */
function getDevice(): SidebarDevice {
  if (typeof window === "undefined") {
    return "desktop";
  }

  const width = window.innerWidth;

  if (width < 640) {
    return "mobile";
  }

  if (width < 1024) {
    return "tablet";
  }

  return "desktop";
}

/* ============================================================================
 * Sidebar Provider Component
 * ============================================================================
 */

export function SidebarProvider({ children }: SidebarProviderProps) {
  const [state, dispatch] = useReducer(sidebarReducer, initialSidebarState);
  const previousDevice = useRef<SidebarDevice | null>(null);

  /**
   * Sync device breakpoint mabadiliko ya window screen yanapotokea.
   */
  useEffect(() => {
    const syncDevice = () => {
      const device = getDevice();

      if (previousDevice.current === device) {
        return;
      }

      previousDevice.current = device;
      const rules = getSidebarRules(device);
      const variant = resolveSidebarVariant(device, rules.defaultSize);

      dispatch({
        type: "RESET_FOR_DEVICE",
        payload: {
          device,
          size: rules.defaultSize,
          variant,
          isOpen: rules.defaultOpen,
        },
      });
    };

    syncDevice();
    window.addEventListener("resize", syncDevice);

    return () => {
      window.removeEventListener("resize", syncDevice);
    };
  }, []);

  /**
   * Tengeneza Context value ikiwa na memoization kuzuia re-renders zisizo na haja.
   */
  const contextValue = useMemo<SidebarContextType>(
    () => ({
      ...state,

      isMobile: state.device === "mobile",
      isTablet: state.device === "tablet",
      isDesktop: state.device === "desktop",

      /**
       * Badilisha variant ya sidebar kwa mkono (kama inaruhusiwa kwenye kifaa husika).
       */
      setVariant: (variant) => {
        if (!isVariantAllowed(state.device, variant)) {
          return;
        }

        dispatch({
          type: "SET_LAYOUT",
          payload: {
            size: state.size,
            variant,
          },
        });
      },

      /**
       * Badilisha size ya sidebar (minimal/expanded).
       */
      setSize: (size) => {
        if (!isSizeAllowed(state.device, size)) {
          return;
        }

        const variant = resolveSidebarVariant(state.device, size);

        dispatch({
          type: "SET_LAYOUT",
          payload: {
            size,
            variant,
          },
        });
      },

      /**
       * Fungua Sidebar (Open Behavior).
       *
       * - Desktop: Ignored.
       * - Tablet: Inahifadhi layout ya zamani na kufungua floating overlay.
       * - Mobile: Inafungua drawer.
       */
      open: () => {
        if (state.device === "desktop") {
          return;
        }

        if (state.device === "tablet") {
          dispatch({ type: "SAVE_PREVIOUS_LAYOUT" });
          dispatch({
            type: "SET_LAYOUT",
            payload: {
              size: "expanded",
              variant: "floating",
            },
          });
        }

        dispatch({ type: "OPEN" });
      },

      /**
       * Funga Sidebar (Close Behavior).
       *
       * - Desktop: Ignored.
       * - Tablet: Inarudisha layout ya zamani (restore).
       * - Mobile: Inafunga drawer.
       */
      close: () => {
        if (state.device === "desktop") {
          return;
        }

        if (state.device === "tablet") {
          dispatch({ type: "RESTORE_PREVIOUS" });
          return;
        }

        dispatch({ type: "CLOSE" });
      },

      /**
       * Badilisha pakua (Toggle Open/Close State).
       */
      toggle: () => {
        if (state.device === "desktop") {
          return;
        }

        if (state.isOpen) {
          if (state.device === "tablet") {
            dispatch({ type: "RESTORE_PREVIOUS" });
            return;
          }

          dispatch({ type: "CLOSE" });
          return;
        }

        dispatch({ type: "OPEN" });
      },

      /**
       * Set hover expansion state pindi mtumiaji anapoweka mouse kwenye minimal sidebar.
       */
      setHoverExpanded: (expanded) => {
        dispatch({
          type: "SET_HOVER_EXPANDED",
          payload: expanded,
        });
      },
    }),
    [state]
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      {children}
    </SidebarContext.Provider>
  );
}