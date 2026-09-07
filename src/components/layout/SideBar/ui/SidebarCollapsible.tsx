
import { useEffect, useState, type ElementType } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils/helper";
import { SidebarIcon } from "./SidebarIcon";
import { EduTooltip } from "@/components/atoms";
import { useSidebar } from "../useSidebar";
import { EduFloatingDiv } from "@/components/modals";

/**
 * Inawakilisha kiunganishi cha chini (sub-item) ndani ya collapsible menu.
 */
interface SidebarChild {
  /** Jina la sub-item */
  title: string;
  /** Njia (URL path) ya sub-item */
  href: string;
}

/**
 * Props zinazohitajika na component ya `SidebarCollapsible`.
 */
interface SidebarCollapsibleProps {
  /** Jina kuu la menyu inayoweza kufunguka/kufungwa */
  title: string;
  /** Component au jina la ikoni ya menyu */
  icon: ElementType;
  /** Orodha ya sub-items zilizo ndani ya menyu hii */
  items: SidebarChild[];
  /** Inafafanua kama sidebar imekunjwa (collapsed) au la */
  collapsed?: boolean;
  /** Njia ya sasa ya URL (Current URL path) kwa ajili ya kuangalia na kuweka active state */
  currentPath?: string;
}

/**
 * Component inayowakilisha menyu yenye sub-items zinazoweza kufunguka au kukunjwa (Collapsible Menu).
 * 
 * - Inafungua menyu kiotomatiki ikiwa moja ya sub-items ipo active kulingana na `currentPath`.
 * - Inabadilika kuwa icon yenye Tooltip & Floating Submenu pindi sidebar inapokuwa kwenye mode ya `minimal`.
 */
export function SidebarCollapsible({
  title,
  icon,
  items,
  collapsed: propsCollapsed,
  currentPath = "",
}: SidebarCollapsibleProps) {
  const { size } = useSidebar();

  // Inapendelea state ya useSidebar kama haijapitishwa kupitia props
  const isCollapsed = propsCollapsed ?? size === "minimal";

  // Inakagua kama kuna mtoto (sub-item) yeyote aliye active kwa sasa
  const hasActiveChild = items.some(
    (item) =>
      currentPath === item.href || currentPath.startsWith(`${item.href}/`)
  );

  const [open, setOpen] = useState(hasActiveChild);

  // Hakikisha menyu inajifungua kiotomatiki kama child yeyote akiwa active
  useEffect(() => {
    if (hasActiveChild) {
      setOpen(true);
    }
  }, [hasActiveChild]);

  return (
    <div className="w-full">
      {/* COLLAPSED / MINIMAL MODE */}
      {isCollapsed ? (
        <div className="flex items-center justify-center">
          
            <EduFloatingDiv
              side="right"
              spacing={12}
              trigger={
                <EduTooltip content={title} side="right">
                <button
                  type="button"
                  aria-label={title}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200 cursor-pointer",
                    hasActiveChild
                      ? "bg-primary-100/80 text-primary-600 dark:bg-primary-950/40"
                      : "text-muted-500 hover:bg-muted-100 hover:text-muted-900"
                  )}
                >
                  <SidebarIcon
                    component={icon}
                    className={cn(
                      "h-5 w-5 shrink-0 transition-colors",
                      hasActiveChild ? "text-primary-600" : "text-muted-600"
                    )}
                  />
                </button>
                </EduTooltip>
                
              }
            >
              {/* Premium Modern Popout Card */}
              <div className="min-w-[200px] rounded-xl border border-border/60 bg-white p-1.5 shadow-xl backdrop-blur-md">
                {/* Popout Header Title */}
                <div className="px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-400 border-b border-border/40 mb-1">
                  {title}
                </div>

                {/* Popout Items */}
                <div className="space-y-0.5">
                  {items.map((child) => {
                    const active =
                      currentPath === child.href ||
                      currentPath.startsWith(`${child.href}/`);

                    return (
                      <Link
                        key={child.href}
                        to={child.href}
                        className={cn(
                          "flex items-center h-8 px-2.5 rounded-lg text-xs font-medium transition-all duration-150",
                          active
                            ? "bg-primary-500 text-white shadow-sm"
                            : "text-muted-600 hover:bg-muted-100 hover:text-muted-900"
                        )}
                      >
                        {child.title}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </EduFloatingDiv>
          
        </div>
      ) : (
        /* EXPANDED MODE BUTTON */
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "flex items-center justify-between w-full h-9 px-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer group",
            hasActiveChild
              ? "bg-primary-50/80 text-primary-600 font-semibold"
              : "text-muted-600 hover:bg-muted-100 hover:text-muted-900"
          )}
        >
          <div className="flex items-center gap-3 truncate">
            <SidebarIcon
              component={icon}
              className={cn(
                "h-4 w-4 shrink-0 transition-colors",
                hasActiveChild ? "text-primary-600" : "text-muted-500 group-hover:text-muted-800"
              )}
            />
            <span className="truncate">{title}</span>
          </div>

          <ChevronDown
            size={16}
            className={cn(
              "shrink-0 text-muted-400 transition-transform duration-200",
              open && "rotate-180 text-muted-700"
            )}
          />
        </button>
      )}

      {/* EXPANDED SUB-ITEMS AREA */}
      {!isCollapsed && open && (
        <div className="mt-1 ml-4 pl-3 border-l-2 border-border/60 space-y-1">
          {items.map((child) => {
            const active =
              currentPath === child.href ||
              currentPath.startsWith(`${child.href}/`);

            return (
              <Link
                key={child.href}
                to={child.href}
                className={cn(
                  "flex items-center h-8 px-3 rounded-lg text-xs font-medium transition-all duration-150 relative group",
                  active
                    ? "bg-primary-500 text-white font-semibold shadow-xs"
                    : "text-muted-600 hover:bg-muted-100 hover:text-muted-900"
                )}
              >
                {/* Visual Active Indicator Bar */}
                {active && (
                  <span className="absolute -left-[15px] top-1/2 -translate-y-1/2 w-1 h-4 bg-primary-500 rounded-r-full" />
                )}
                <span className="truncate">{child.title}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}