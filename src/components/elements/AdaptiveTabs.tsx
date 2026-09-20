/**
 * @file AdaptiveTabs.tsx
 * @description Enterprise-grade adaptive navigation component featuring gradient fade masks,
 * smooth horizontal scrolling, minimal chevron overlays, and full mouse/touch drag-to-scroll support.
 */

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib";

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number | string;
}

interface AdaptiveTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  isMobile?: boolean;
  breakpoint?: number;
  className?: string;
  tabBtnClassName?: string;
  activeTabClassName?: string;
  tabsWrapperClassName?: string,
  dropdownTriggerClassName?: string;
}

export function AdaptiveTabs({ 
  tabs, 
  activeTab, 
  onChange, 
  isMobile: isMobileProp,
  breakpoint = 768,
  className,
  tabBtnClassName,
  activeTabClassName,
  tabsWrapperClassName,
  dropdownTriggerClassName,
}: AdaptiveTabsProps) {
  const [windowMobile, setWindowMobile] = useState<boolean>(window.innerWidth < breakpoint);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  
  // References na States kwa ajili ya Scroll na Drag-to-Scroll (Mouse & Touch)
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftScroll, setShowLeftScroll] = useState<boolean>(false);
  const [showRightScroll, setShowRightScroll] = useState<boolean>(false);

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [startX, setStartX] = useState<number>(0);
  const [scrollLeftState, setScrollLeftState] = useState<number>(0);

  useEffect(() => {
    const handleResize = () => {
      setWindowMobile(window.innerWidth < breakpoint);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);

  const mobileView = isMobileProp !== undefined ? isMobileProp : windowMobile;
  const currentTabObj = tabs.find((t) => t.id === activeTab) || tabs[0];

  const checkScrollPosition = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setShowLeftScroll(scrollLeft > 10);
    setShowRightScroll(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    if (!mobileView) {
      checkScrollPosition();
      window.addEventListener("resize", checkScrollPosition);
      return () => window.removeEventListener("resize", checkScrollPosition);
    }
  }, [mobileView, tabs]);

  const scrollTabs = (direction: "left" | "right") => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollAmount = direction === "left" ? -200 : 200;
    el.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  // ================= DRAG TO SCROLL (MOUSE & TOUCH) HANDLERS =================
  const handleMouseDown = (e: React.MouseEvent) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setIsDragging(true);
    setStartX(e.pageX - el.offsetLeft);
    setScrollLeftState(el.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const el = scrollContainerRef.current;
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX) * 1.5; // Kasi ya kuvuta (Multiplier)
    el.scrollLeft = scrollLeftState - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className={cn("w-full", className)}>
      {mobileView ? (
        /* ================= MOBILE VIEW: DROPDOWN SELECTOR ================= */
        <div className="relative w-full">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={cn(
              "w-full flex items-center justify-between bg-white border border-gray-200/90 hover:border-gray-300",
              "text-gray-800 text-sm font-medium px-4 py-2.5 rounded-xl shadow-2xs transition-all cursor-pointer",
              dropdownTriggerClassName
            )}
          >
            <div className="flex items-center gap-2.5 truncate">
              {currentTabObj?.icon && (
                <span className="text-gray-500 shrink-0">{currentTabObj.icon}</span>
              )}
              <span className="truncate">{currentTabObj?.label}</span>
            </div>
            <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0", dropdownOpen && "rotate-180")} />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setDropdownOpen(false)} />
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg z-30 overflow-hidden py-1 divide-y divide-gray-50">
                {tabs.map((tab) => {
                  const isActive = tab.id === activeTab;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        onChange(tab.id);
                        setDropdownOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-2.5 text-xs sm:text-sm font-medium text-left transition-colors cursor-pointer",
                        isActive ? "bg-gray-100/80 text-gray-900 font-semibold" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        {tab.icon && (
                          <span className={isActive ? "text-gray-900" : "text-gray-400"}>
                            {tab.icon}
                          </span>
                        )}
                        <span className="truncate">{tab.label}</span>
                      </div>
                      {tab.badge !== undefined && (
                        <span className="ml-2 px-2 py-0.5 text-[10px] bg-gray-100 text-gray-600 rounded-full font-mono">
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      ) : (
        /* ================= DESKTOP VIEW: DRAGGABLE, SCROLLABLE & FADED TABS ================= */
        <div className="relative flex items-center w-full min-w-0 group">
          
          {/* Left Gradient Fade & Minimal Chevron Indicator */}
          {showLeftScroll && (
            <div className="absolute left-0 inset-y-0 z-10 flex items-center pl-0.5 pr-3 bg-gradient-to-r from-gray-200/97 via-gray-200/85 to-transparent pointer-events-none rounded-l-xl">
              <button
                type="button"
                onClick={() => scrollTabs("left")}
                className="text-gray-600 hover:text-gray-900 transition-colors pointer-events-auto cursor-pointer focus:outline-none"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          )}

          {/* Scrollable & Draggable Container */}
          <div 
            ref={scrollContainerRef}
            onScroll={checkScrollPosition}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            className={cn(
              "flex items-center gap-1 overflow-x-auto scrollbar-none bg-gray-200/50 border border-gray-100 p-0.5 rounded-xl w-full min-w-0 scroll-smooth select-none",
              isDragging ? "cursor-grabbing" : "cursor-grab", tabsWrapperClassName
            )}
          >
            {tabs.map((tab) => {
              const isActive = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    // Zuia click kufanyika kama mtumiaji alikuwa anafanya drag (kuvuta)
                    if (isDragging) return;
                    onChange(tab.id);
                  }}
                  className={cn(
                    "inline-flex items-center gap-2 py-2 px-3.5 rounded-lg font-medium text-sm sm:text-sm transition-all whitespace-nowrap shrink-0 cursor-pointer",
                    isActive 
                      ? cn("bg-white text-gray-900 shadow-xs font-semibold", activeTabClassName)
                      : cn("hover:text-gray-700 hover:text-900 hover:font-medium", tabBtnClassName)
                  )}
                >
                  {tab.icon && (
                    <span className={isActive ? "text-gray-900" : "text-gray-400 shrink-0"}>
                      {tab.icon}
                    </span>
                  )}
                  <span className="truncate">{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span className={cn(
                      "ml-1 px-1.5 py-0.5 text-[10px] rounded-full font-mono shrink-0",
                      isActive ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-600"
                    )}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Gradient Fade & Minimal Chevron Indicator */}
          {showRightScroll && (
            <div className="absolute right-0 inset-y-0 z-10 flex items-center justify-end pr-0.5 pl-3 bg-gradient-to-l from-gray-200/97 via-gray-200/85 to-transparent pointer-events-none rounded-r-xl">
              <button
                type="button"
                onClick={() => scrollTabs("right")}
                className="text-gray-600 hover:text-gray-900 transition-colors pointer-events-auto cursor-pointer focus:outline-none"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  );
}