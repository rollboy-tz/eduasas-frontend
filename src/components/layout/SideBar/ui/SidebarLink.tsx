import { Link } from "react-router-dom";
import { cn } from "@/lib/utils/helper";
import { SidebarIcon } from "./SidebarIcon";
import { useSidebar } from "../useSidebar";
import { EduTooltip } from "@/components/atoms";

interface SidebarLinkProps {
  title: string;
  href: string;
  icon: any;
  active?: boolean;
  badge?: number;
  collapsed?: boolean;
}

export function SidebarLink({
  title,
  href,
  icon,
  active = false,
  badge,
  collapsed = false,
}: SidebarLinkProps) {
  const { size } = useSidebar();
  collapsed = size === "minimal";

  const link = (
    <Link
      to={href}
      className={cn(
        "flex items-center w-full h-9 rounded-lg transition-colors text-sm font-medium",
        collapsed ? "w-full justify-center shrink-0" : "gap-3 px-3",
        active
          ? "bg-primary/10 text-primary font-semibold shadow-2xs"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <SidebarIcon
        component={icon}
        className={cn(
          "shrink-0 transition-colors",
          active ? "text-primary" : "text-muted-foreground"
        )}
      />

      {!collapsed && (
        <>
          <span className="flex-1 truncate">{title}</span>

          {badge !== undefined && (
            <span
              className={cn(
                "min-w-5 h-5 px-1.5 rounded-full text-[11px] flex items-center justify-center font-semibold",
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {badge}
            </span>
          )}
        </>
      )}
    </Link>
  );

  if (collapsed) {
    return (
      <EduTooltip content={`${title}${badge ? ` (${badge})` : ""}`} side="right">
        {link}
      </EduTooltip>
    );
  }

  return link;
}

export default SidebarLink;
