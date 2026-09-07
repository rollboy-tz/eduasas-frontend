/**
 * ============================================================================
 * EduAsas Sidebar V2 - Mock Menu Configuration
 * ============================================================================
 *
 * Mock navigation data kwa testing ya Sidebar V2.
 *
 * Baadaye hii inaweza kubadilishwa kuwa:
 *
 * - Permission based menu
 * - Role based menu
 * - Feature flags
 * - Subscription based menu
 *
 * @version 2.0.0
 */


// import {
//   LayoutDashboard,
//   School,
//   Users,
//   GraduationCap,
//   BookOpen,
//   ClipboardList,
//   FileText,
//   Settings,
//   CreditCard,
// } from "lucide-react";


import type {
  MenuGroup,
} from "@/types";



/**
 * Main sidebar navigation items.
 */
export const HomeMockData: MenuGroup[] = [
  {
    label: "Main",
    items: [
      { title: "Home", href: "home", icon: "Home" },
      {
        title: "Schools", icon: "School",
        items: [
          { title: "My Schools", href: "/schools" },
          { title: "Add School", href: "/schools/add" },
          { title: "Setup School", href: "/schools/setup" }
        ]
      }
    ]
  }
];


export const SchoolMockData: MenuGroup[] = [
  {
    label: "Main",
    items: [
      { title: "Dashboard", href: "/Dashboard", icon: "LayoutDashboard" },
      { title: "Students", icon: "Users", href: "/students" }
    ]
  }
];