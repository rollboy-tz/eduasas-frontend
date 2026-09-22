import { type IconComponent } from './IconResolver';

export interface NavItem {
  id: string;
  label: string;
  icon: IconComponent;
  href?: string;
  active?: boolean;
}

export interface NavSection {
  id: string;
  label?: string;
  items: NavItem[];
}
