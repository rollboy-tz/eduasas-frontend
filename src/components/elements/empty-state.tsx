"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  /**
   * Icon ya Lucide inayowakilisha eneo husika (e.g., MailPlus, Users, FolderOff)
   */
  icon: LucideIcon;
  /**
   * Kichwa cha habari cha ujumbe (e.g., "No staff invitations sent")
   */
  title: string;
  /**
   * Maelezo mafupi ya nini kifanyike (e.g., "Click Add Staff to send new invitations")
   */
  description: string;
  /**
   * Kama unataka kuweka kifungo (Button) au maudhui ya ziada chini ya maelezo
   */
  action?: React.ReactNode;
  /**
   * Washa `true` kama unataka mstari wa mshazari (/) uikate icon katikati kuashiria "Not Found" au "Empty"
   */
  hasSlash?: boolean;
  /**
   * Class za ziada za container kuu la nje
   */
  className?: string;
  /**
   * Class za ku-customize mduara wa icon (e.g., kubadili bg au rangi ya mpaka)
   */
  iconContainerClassName?: string;
  /**
   * Class za ku-style icon yenyewe ya Lucide (e.g., text-primary, text-muted-foreground)
   * kukiwa na class default inakuwa na opacity 40 ubaweza kuongeza
   */
  iconClassName?: string;
  /**
   * Rangi ya slash mstari unaopita default ni (foreground) unaweza kupitisha (primary, muted nk...)
   */
  slashColor?: string;

  /**
   * 
   * Asilimia za urefu wa slash kulingana na continer default ni (110) number (bila alama %)
   */
  slashHeightPercentage?: number;

  /**
   * Degree za ulalo wa slash number defalt ni (45) usipitishe neno (deg)
   */
  slashRotateDeg?: number;
} 

/**
 * ### 📦 EmptyState (The Universal Feedback Machine)
 * Component ya kiwango cha juu kwa ajili ya kuonyesha kurasa ambazo hazina data au matokeo yaliyotafutwa hayajapatikana.
 * Inaruhusu kupitisha Icon yoyote, maelezo, na ina uwezo wa kuweka mstari wa kishua wa mshazari (/) unaokata icon dynamically.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  hasSlash = true,
  className,
  iconContainerClassName,
  iconClassName,
  slashColor = 'foreground',
  slashHeightPercentage = 110,
  slashRotateDeg = 45
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "w-full flex flex-col justify-center items-center py-16 px-4 text-center select-none bg-inherit",
        className
      )}
    >
      {/* 📦 ICON MATRIX WITH DYNAMIC SLASH (/) */}
      <div
        className={cn(
          "relative w-14 h-14 rounded-full flex items-center justify-center mb-4 border border-border/60",
          
          // UCHUCHU WA MSTARI: Kama hasSlash ikiwa true, tunapiga spana ya pseudo-element hapa hapa
          hasSlash && [
            "after:content-[''] after:absolute after:w-[2px]",
            `after:bg-${slashColor}  after:h-[${slashHeightPercentage}%] after:rotate-[${slashRotateDeg}deg]`, // Inachukua rangi ya background ya sasa (Light/Dark automatically)
            "after:transform after:origin-center after:z-10",
            "after:shadow-xs"
          ],
          
          iconContainerClassName
        )}
      >
        <Icon 
          className={cn(
            "w-6 h-6 relative z-0", 
            hasSlash ? "opacity-40" : "opacity-100", // Kama imekatwa, ififishe icon kidogo
            iconClassName
          )} 
          strokeWidth={2} 
        />
      </div>

      {/* 📝 TEXT MATRIX */}
      <div className="max-w-xs space-y-1.5">
        <h3 className="text-base font-bold text-foreground tracking-tight">
          {title}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>

      {/* ⚡ ACTION LAYER (Kama kuna Button ya kuitupa chini yake) */}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}