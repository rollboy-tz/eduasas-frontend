import { IconComponent } from "./_components";


export interface NavItem {
  id: string;
  label: string;
  icon: IconComponent;
  href?: string;
  active?: boolean;
  /** Submenu items. Ukiweka hii, kitufe kinakuwa cha kufungua/kufunga (accordion). */
  children?: NavItem[];
}

export interface NavSection {
  id: string;
  label?: string;
  items: NavItem[];
}