
import type { ReactNode } from "react";
import type { MenuGroup } from "@/types";
import { SidebarComposer } from "./SidebarComposer";
import { SidebarHeader } from "./SidebarHeader";
import { SidebarNavigation } from "./SidebarNavigation";
import { SidebarOverlay } from "./SidebarOverlay";
import { SidebarShell } from "./SidebarShell";
import { useSidebar } from "../useSidebar";
import { HomeMockData } from "../SidebarMockData";

/**
 * ============================================================================
 * EduAsas Sidebar V2 - Sidebar Root
 * ============================================================================
 *
 * Main composition component ya Sidebar V2 inayoratibu sehemu zote za sidebar.
 *
 * Majukumu (Responsibilities):
 * - Kuunda hierarchy ya Sidebar UI kwa kuunganisha Overlay, Shell, Header, na Navigation.
 * - Kuhakikisha sehemu mbalimbali za sidebar ziko kwenye mpangilio sahihi.
 * - Kutoa nafasi ya nyongeza (extension area) kupitia props za `children`.
 *
 * Haitawali (Non-responsibilities):
 * - Sidebar state management au Responsive behaviors.
 * - Device rules na Permissions.
 * - Menu configuration logic (Hizo ziko chini ya Provider na Composer).
 *
 * @version 2.0.0
 */

export interface SidebarProps {
  /** Optional custom content ya kuweka kabla au baada ya navigation. */
  children?: ReactNode;
  /** Orodha ya data ya menyu kutoka kwenye mradi wako. */
  itemsData?: MenuGroup[];
}

/**
 * Sidebar V2 Root Component.
 *
 * Composition layer inayoleta pamoja muundo mzima wa Sidebar UI.
 *
 * @example
 * ```tsx
 * <Sidebar itemsData="{menuItems}"/>
 * ```
 */
export function Sidebar({ children, itemsData }: SidebarProps) {

  const { size } = useSidebar();

  const collapsed = size === "minimal";

  return (
    <>
      {/* Dynamic Overlay for mobile/tablet floating modes */}
      <SidebarOverlay />

      {/* Main Structural Shell */}
      <SidebarShell>
        <div className="flex h-full min-h-0 flex-col">
          {/* Top area: Logo & Toggle icon */}
          <SidebarHeader />

          {/* Main navigation area: Scrollable menu items */}
          <SidebarNavigation>
            <SidebarComposer
              menuData={itemsData ?? HomeMockData }
              currentPath=""
              collapsed={collapsed}
            />
          </SidebarNavigation>

          {/* Extension area: Upgrade cards, custom options, etc. */}
          {children && <div className="shrink-0">{children}</div>}
        </div>
      </SidebarShell>
    </>
  );
}