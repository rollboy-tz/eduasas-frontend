
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils/helper";
import { SidebarIcon } from "./SidebarIcon";
import { useSidebar } from "../useSidebar";
import { EduTooltip } from "@/components/atoms";

/**
 * Props zinazohitajika na component ya `SidebarLink`.
 */
interface SidebarLinkProps {
  /** Jina au anwani inayoelezea kiungo (link) */
  title: string;
  /** Njia (URL path) ambapo kiungo kinapeleka */
  href: string;
  /** Component au jina la ikoni inayotumiwa na kiungo hiki */
  icon: any;
  /** Inafafanua kama kiungo kipo active kwa sasa */
  active?: boolean;
  /** Idadi ya notifications/taarifa za kuonyeshwa pembeni ya kiungo (optional) */
  badge?: number;
  /** Inafafanua kama sidebar imekunjwa (collapsed) au la */
  collapsed?: boolean;
}

/**
 * Component inayowakilisha kiungo kimoja cha menyu kwenye sidebar.
 * 
 * - Inasaidia hali ya `active` kwa kubadilisha rangi ya background na maandishi.
 * - Inaonyesha `badge` ya idadi ya taarifa pindi haijakunjwa (`collapsed = false`).
 * - Inatumia `EduTooltip` kuonyesha jina la kiungo pindi sidebar inapokuwa imekunjwa (`collapsed = true`).
 */
export function SidebarLink({
  title,
  href,
  icon,
  active = false,
  badge,
  collapsed = false,
}: SidebarLinkProps) {

  const { size } = useSidebar();

  const aciveColor = active ? "blue-500" : "none";

  collapsed = size === "minimal";

  const link = (
    <Link
      to={href}
      className={cn(
        "flex items-center w-full h-8 rounded-md transition-colors text-sm font-medium",
        collapsed ? "w-full justify-center shrink-0" : "gap-3 px-3",
        active
          ? "bg-primary-50 text-primary-600"
          : "text-muted-600 hover:bg-muted-200 hover:text-muted-900"
      )}
    >
      <SidebarIcon
        component={icon}
        fill={aciveColor}
        className={cn(
          "shrink-0",
          active ? "text-primary-600" : "text-muted-700"
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
                  ? "bg-primary-600 text-white"
                  : "bg-muted-200 text-muted-700"
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