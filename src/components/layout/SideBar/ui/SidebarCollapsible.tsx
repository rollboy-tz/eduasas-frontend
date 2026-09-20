import { useEffect, useState, type ElementType } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils/helper";
import { SidebarIcon } from "./SidebarIcon";
import { EduTooltip } from "@/components/atoms";
import { useSidebar } from "../useSidebar";
import { EduFloatingDiv } from "@/components/modals";

interface SidebarChild {
  title: string;
  href: string;
}

interface SidebarCollapsibleProps {
  title: string;
  icon: ElementType;
  items: SidebarChild[];
  collapsed?: boolean;
  currentPath?: string;
}

export function SidebarCollapsible({
  title,
  icon,
  items,
  collapsed: propsCollapsed,
  currentPath = "",
}: SidebarCollapsibleProps) {
  const { size } = useSidebar();
  const isCollapsed = propsCollapsed ?? size === "minimal";

  const hasActiveChild = items.some(
    (item) =>
      currentPath === item.href || currentPath.startsWith(`${item.href}/`)
  );

  const [open, setOpen] = useState(hasActiveChild);

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
                      ? "bg-primary/10 text-primary shadow-2xs"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <SidebarIcon
                    component={icon}
                    className={cn(
                      "shrink-0 transition-colors",
                      hasActiveChild ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                </button>
              </EduTooltip>
            }
          >
            {/* Popout Card */}
            <div className="min-w-[200px] rounded-lg border border-border bg-popover text-popover-foreground p-1.5 shadow-xl backdrop-blur-md">
              {/* Popout Header Title */}
              <div className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/50 mb-1">
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
                        "flex items-center h-8 px-2.5 rounded-md text-xs font-medium transition-all duration-150",
                        active
                          ? "bg-primary text-primary-foreground shadow-2xs"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
              ? "bg-primary/10 text-primary font-semibold"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <div className="flex items-center gap-3 truncate">
            <SidebarIcon
              component={icon}
              className={cn(
                "shrink-0 transition-colors",
                hasActiveChild ? "text-primary" : "text-muted-foreground"
              )}
            />
            <span className="truncate">{title}</span>
          </div>

          <ChevronDown
            size={16}
            className={cn(
              "shrink-0 text-muted-foreground transition-transform duration-300",
              open && "rotate-180 text-foreground"
            )}
          />
        </button>
      )}

      {/* EXPANDED SUB-ITEMS AREA */}
      {!isCollapsed && open && (
        <div className="mt-1 ml-4 pl-3 border-l-2 border-border space-y-1">
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
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {/* Visual Active Indicator Bar */}
                {active && (
                  <span className="absolute -left-[15px] top-1/2 -translate-y-1/2 w-1 h-4 bg-primary rounded-r-full" />
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

export default SidebarCollapsible;
