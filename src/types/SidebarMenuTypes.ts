
export interface MenuItem {
    title: string;
    href?: string;
    icon: string;
    badge?: number;
    items?: { title: string; href: string }[]; // Kama ana watoto (Collapsible)
  }
  
  export interface MenuGroup {
    label: string;
    items: MenuItem[];
  }
