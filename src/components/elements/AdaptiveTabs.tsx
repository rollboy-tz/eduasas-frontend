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
  tabsWrapperClassName?: string;
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
  const [windowMobile, setWindowMobile] = useState<boolean>(
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false
  );
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  
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

  // Drag-to-scroll handlers
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
    const walk = (x - startX) * 1.5;
    el.scrollLeft = scrollLeftState - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className={cn("w-full", className)}>
      {mobileView ? (
        /* Mobile Dropdown Selector */
        <div className="relative w-full">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={cn(
              "w-full flex items-center justify-between bg-card border border-border hover:border-border/80",
              "text-foreground text-sm font-medium px-4 py-2.5 rounded-lg shadow-2xs transition-all cursor-pointer",
              dropdownTriggerClassName
            )}
          >
            <div className="flex items-center gap-2.5 truncate">
              {currentTabObj?.icon && (
                <span className="text-muted-foreground shrink-0">{currentTabObj.icon}</span>
              )}
              <span className="truncate">{currentTabObj?.label}</span>
            </div>
            <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform duration-200 shrink-0", dropdownOpen && "rotate-180")} />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setDropdownOpen(false)} />
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-card border border-border rounded-lg shadow-xl z-30 overflow-hidden py-1 divide-y divide-border/50">
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
                        isActive ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        {tab.icon && (
                          <span className={isActive ? "text-primary" : "text-muted-foreground"}>
                            {tab.icon}
                          </span>
                        )}
                        <span className="truncate">{tab.label}</span>
                      </div>
                      {tab.badge !== undefined && (
                        <span className="ml-2 px-2 py-0.5 text-[10px] bg-muted text-muted-foreground rounded-full font-mono">
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
        /* Desktop View: Tabs with scroll and fade */
        <div className="relative flex items-center w-full min-w-0 group">
          
          {showLeftScroll && (
            <div className="absolute left-0 inset-y-0 z-10 flex items-center pl-1 pr-3 bg-gradient-to-r from-background via-background/80 to-transparent pointer-events-none rounded-l-lg">
              <button
                type="button"
                onClick={() => scrollTabs("left")}
                className="text-muted-foreground hover:text-foreground transition-colors pointer-events-auto cursor-pointer focus:outline-none"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          )}

          <div 
            ref={scrollContainerRef}
            onScroll={checkScrollPosition}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            className={cn(
              "flex items-center gap-1 overflow-x-auto scrollbar-none bg-muted/40 border border-border/60 p-1 rounded-lg w-full min-w-0 scroll-smooth select-none",
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
                    if (isDragging) return;
                    onChange(tab.id);
                  }}
                  className={cn(
                    "inline-flex items-center gap-2 py-1.5 px-3 rounded-md font-medium text-sm transition-all whitespace-nowrap shrink-0 cursor-pointer",
                    isActive 
                      ? cn("bg-card text-foreground shadow-2xs font-semibold", activeTabClassName)
                      : cn("text-muted-foreground hover:text-foreground hover:bg-muted/60", tabBtnClassName)
                  )}
                >
                  {tab.icon && (
                    <span className={isActive ? "text-primary" : "text-muted-foreground shrink-0"}>
                      {tab.icon}
                    </span>
                  )}
                  <span className="truncate">{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span className={cn(
                      "ml-1 px-1.5 py-0.5 text-[10px] rounded-full font-mono shrink-0",
                      isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {showRightScroll && (
            <div className="absolute right-0 inset-y-0 z-10 flex items-center justify-end pr-1 pl-3 bg-gradient-to-l from-background via-background/80 to-transparent pointer-events-none rounded-r-lg">
              <button
                type="button"
                onClick={() => scrollTabs("right")}
                className="text-muted-foreground hover:text-foreground transition-colors pointer-events-auto cursor-pointer focus:outline-none"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

export default AdaptiveTabs;
