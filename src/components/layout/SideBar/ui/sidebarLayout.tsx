"use client";

import type { ReactNode } from "react";
import type { MenuGroup } from "@/types";
import { useSidebar } from "../useSidebar";
import { SIDEBAR_WIDTH, shouldPushContent } from "../SidebarRules";
import { Sidebar } from "./Sidebar";

/**
 * ============================================================================
 * EduAsas Sidebar V2 - Sidebar Layout
 * ============================================================================
 *
 * Mfumo mkuu wa layout unaoratibu Sidebar na eneo la yaliyomo (Main Content).
 *
 * Majukumu (Responsibilities):
 * - Ku-render Sidebar pamoja na content ya ukurasa.
 * - Kukokotoa na kuweka offset (margin-left) ya content kulingana na muundo wa Sidebar.
 * - Kutoa muundo unaojirekebisha kwa ukubwa wa vioo (Responsive layout).
 *
 * Haitawali (Non-responsibilities):
 * - Ku-render logic ya menyu za ndani ya Sidebar (inafanywa na Sidebar component).
 * - Kupanga state ya Sidebar moja kwa moja.
 *
 * @version 2.2.0
 */

export interface SidebarLayoutProps {
  /** Orodha ya data ya menyu kwa ajili ya Sidebar. */
  data: MenuGroup[];
  /** Component ya Header ya juu (kama ipo). */
  header?: ReactNode;
  /** Yaliyomo makuu ya ukurasa (Page content). */
  children: ReactNode;
}

export function SidebarLayout({
  data,
  header,
  children,
}: SidebarLayoutProps) {
  const { device, variant, size, isOpen } = useSidebar();

  // Angalia ikiwa content inatakiwa kusukumwa pembeni (Push) au la
  const shouldPush = shouldPushContent(device, variant);

  // Kokotoa nafasi ya margin-left kwa ajili ya main content
  const contentOffset = shouldPush && isOpen ? SIDEBAR_WIDTH[size] : 0;

  return (
    <div className="relative flex h-screen overflow-hidden">
      {/* Dynamic Sidebar Component */}
      <Sidebar itemsData={data} />

      {/* Main Layout Area */}
      <section
        className="flex min-w-0 flex-1 flex-col px-2 sm:px-4 md:px-6 lg:px-8 transition-[margin] duration-300 ease-out"
        style={{ marginLeft: contentOffset }}
      >
        {/* Sticky Header Section */}
        {header && (
          <header className="sticky top-0 z-40 shrink-0 mb-1">
            {header}
          </header>
        )}

        {/* Scrollable Main Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </section>
    </div>
  );
}