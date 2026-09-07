/**
 * @fileoverview MoreActionsList Component - Enterprise Edition
 * @author Injinia Rollboy (EduAsas Tech)
 * @version 2.0.0-Enterprise
 */

"use client";

import React, { useState } from "react";
import { EduFloatingDiv } from "./EduFloatingCard";
import { cn } from "@/lib/utils/helper";

/**
 * Interface representing a single action item in the list.
 */
export interface Action {
  /** Label text of the action. */
  label: string;
  
  /** Optional icon displayed next to the label. */
  icon?: React.ReactNode;
  
  /** Callback function executed when the action is clicked. */
  onClick: () => void;
  
  /** Visual variant theme. Defaults to "default". */
  variant?: "default" | "danger" | "success" | "warning";
  
  /** If true, the action is disabled and non-interactive. */
  disabled?: boolean;
  
  /** Optional badge or counter text displayed on the right side. */
  badge?: string | number;
  
  /** Optional category/group name to visually section actions. */
  group?: string;
}

/**
 * Properties for the MoreActionsList component.
 */
export interface MoreActionsListProps {
  /** The element that triggers the action dropdown menu. */
  trigger: React.ReactNode;
  
  /** Array of actions to display. */
  actions: Action[];
  
  /** If true, disabled actions are still shown but grayed out. If false, they are hidden. */
  showDisabled?: boolean;
  
  /** Additional wrapper classes for the menu container. */
  className?: string;
  
  /** Custom classes for individual action buttons. */
  listClasses?: string;
}

/**
 * @component MoreActionsList
 * @description 
 * An advanced action menu component built on top of EduFloatingDiv. Supports action variants,
 * grouping with dividers, badges, disabled state handling, and smooth enterprise UI styling.
 * 
 * @example
 * ```tsx
 * <MoreActionsList "Edit * Staff", actions="{[" label: onClick: {> edit(), icon: <Edit2 size="{14}"/> },
 *     { label: "Delete", onClick: () => del(), variant: "danger", group: "Danger Zone" }
 *   ]} 
 * />
 * ```
 */
export function MoreActionsList({ 
  trigger, 
  actions, 
  showDisabled = true, 
  className, 
  listClasses 
}: MoreActionsListProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Chuja vitendo kulingana na showDisabled prop
  const filteredActions = showDisabled 
    ? actions 
    : actions.filter((a) => !a.disabled);

  const handleActionClick = (action: Action) => {
    if (action.disabled) return;
    action.onClick();
    setIsOpen(false); // Funga menu baada ya kitendo kubonyezwa
  };

  // Panga vitendo katika makundi (Grouping logic) kama yapo
  const groupedActions = filteredActions.reduce((acc, action) => {
    const groupKey = action.group || "default_group";
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(action);
    return acc;
  }, {} as Record<string, Action[]>);

  const groupKeys = Object.keys(groupedActions);

  return (
    <EduFloatingDiv 
      trigger={<span onClick={() => setIsOpen(!isOpen)}>{trigger}</span>} 
      className="p-0 border-0 rounded-lg shadow-xl"
    >
      <div className={cn("w-52 bg-popover text-popover-foreground border border-border/60 shadow-2xl rounded-xl p-1.5 overflow-hidden backdrop-blur-md", className)}>
        {groupKeys.map((groupKey, groupIndex) => {
          const groupItems = groupedActions[groupKey];
          const hasGroupLabel = groupKey !== "default_group";

          return (
            <div key={groupKey}>
              {/* Divider kati ya makundi */}
              {groupIndex > 0 && <div className="h-px bg-border/50 my-1 -mx-1.5" />}
              
              {/* Kichwa cha Kundi kama kipo */}
              {hasGroupLabel && (
                <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                  {groupKey}
                </div>
              )}

              {groupItems.map((action, index) => {
                const variant = action.variant || "default";
                
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleActionClick(action)}
                    disabled={action.disabled}
                    className={cn(
                      "w-full text-left px-3 py-2 text-xs font-medium transition-all duration-150 flex items-center justify-between rounded-lg group",
                      
                      // Disabled state
                      action.disabled && "opacity-40 cursor-not-allowed pointer-events-none",

                      // Variants styling safi kabisa
                      !action.disabled && variant === "default" && "text-foreground hover:bg-muted hover:text-foreground",
                      !action.disabled && variant === "danger" && "text-red-600 dark:text-red-400 hover:bg-red-500/10",
                      !action.disabled && variant === "warning" && "text-amber-600 dark:text-amber-400 hover:bg-amber-500/10",
                      !action.disabled && variant === "success" && "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10",

                      listClasses
                    )}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {action.icon && (
                        <span className="shrink-0 transition-transform group-hover:scale-110">
                          {action.icon}
                        </span>
                      )}
                      <span className="truncate">{action.label}</span>
                    </div>

                    {/* Optional Badge / Counter */}
                    {action.badge !== undefined && (
                      <span className="ml-auto px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-muted text-muted-foreground">
                        {action.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </EduFloatingDiv>
  );
}