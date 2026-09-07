"use client";

import { memo, useMemo } from "react";

import { SidebarGroup } from "./SidebarGroup";
import { SidebarLink } from "./SidebarLink";
import { SidebarCollapsible } from "./SidebarCollapsible";

import { resolveSidebarIcon } from "./SidebarIconResolver";

/**
 * Inawakilisha kiunganishi cha chini (sub-item) ndani ya menyu kuu.
 */
export interface MenuChild {
  /** Jina au anwani ya kuitambulisha sub-item kwenye menyu */
  title: string;
  /** Njia (URL path) ambapo sub-item inapeleka */
  href: string;
}

/**
 * Inawakilisha kipengele kimoja cha menyu (Menu Item), ambacho kinaweza kuwa na sub-items.
 */
export interface MenuItem {
  /** Jina la kipengele cha menyu */
  title: string;
  /** Njia (URL path) ya kipengele hicho (si lazima ikiwa kina sub-items) */
  href?: string;
  /** Jina la ikoni inayohusika na kipengele hiki */
  icon: string;
  /** Idadi ya taarifa/notifications zinazoonyeshwa pembeni ya menyu (optional) */
  badge?: number;
  /** Orodha ya sub-items zilizo ndani ya menyu hii (optional) */
  items?: MenuChild[];
}

/**
 * Inawakilisha kundi la menyu linalokusanya vipengele kadhaa chini ya lebo moja.
 */
export interface MenuGroup {
  /** Lebo au kichwa cha kundi la menyu */
  label: string;
  /** Orodha ya vipengele vya menyu vilivyopo ndani ya kundi hili */
  items: MenuItem[];
}

/**
 * Props zinazohitajika na component ya `SidebarComposer`.
 */
interface SidebarComposerProps {
  /** Orodha ya makundi ya menyu na vipengele vyake */
  menuData: MenuGroup[];
  /** Njia ya sasa ya URL (Current URL path) kwa ajili ya kuonyesha menyu iliyo active */
  currentPath: string;
  /** Inafafanua kama sidebar imekunjwa (collapsed) au la */
  collapsed?: boolean;
}

/**
 * Component inayokusanya na kutengeneza muundo mzima wa Sidebar (Composer).
 * 
 * Inafanya kazi ya kuchakata `menuData` ili kubaini ikoni inayostahili 
 * na kuangalia ikiwa kiungo kipo active kulingana na `currentPath`.
 */
export const SidebarComposer = memo(
  ({ menuData, currentPath, collapsed = false }: SidebarComposerProps) => {

    /**
     * Inachakata `menuData` na kuongeza `iconComponent` pamoja na hali ya `active` kwa kila item.
     * Inatumia `useMemo` ili kuzuia kuhesabu upya bila lazima ikiwa `menuData` au `currentPath` havijabadilika.
     */
    const groups = useMemo(() => {
      return menuData.map((group) => ({
        ...group,
        items: group.items.map((item) => ({
          ...item,
          iconComponent: resolveSidebarIcon(item.icon),
          active: item.href
            ? currentPath === item.href || currentPath.startsWith(`${item.href}/`)
            : false,
        })),
      }));
    }, [menuData, currentPath]);

    return (
      <>
        {groups.map((group) => (
          <SidebarGroup
            key={group.label}
            label={group.label}
            collapsed={collapsed}
            className="mb-2"
          >
            {group.items.map((item) => {
              // Ikiwa item ina watoto (sub-items), rendered kama collapsible menu
              if (item.items && item.items.length > 0) {
                return (
                  <SidebarCollapsible
                    key={item.title}
                    title={item.title}
                    icon={item.iconComponent}
                    items={item.items}
                    collapsed={collapsed}
                    currentPath={currentPath}
                  />
                );
              }

              // Kama haina watoto, render kama kiungo cha kawaida (SidebarLink)
              return (
                <SidebarLink
                  key={item.title}
                  title={item.title}
                  href={item.href || "#"}
                  icon={item.iconComponent}
                  badge={item.badge}
                  active={item.active}
                  collapsed={collapsed}
                />
              );
            })}
          </SidebarGroup>
        ))}
      </>
    );
  }
);

SidebarComposer.displayName = "SidebarComposer";