"use client";

import { createContext, useContext, useState, ReactNode } from "react";

/**
 * Represents a single breadcrumb item for dynamic header navigation.
 */
export interface BreadcrumbItem {
  /** The display label text of the breadcrumb level. */
  label: string;
  /** Optional URL path or link associated with this breadcrumb segment. */
  href?: string;
}

/**
 * Defines the shape of the advanced workspace context state and actions.
 */
interface WorkspaceContextType {
  /** The current title displayed in the header. */
  pageTitle: string;
  /** The current breadcrumb trail elements. */
  breadcrumbs: BreadcrumbItem[];
  /** Optional React node action buttons rendered in the header toolbar. */
  headerAction: ReactNode | null;
  /** Global boolean indicator showing if an asynchronous save operation is active. */
  isSaving: boolean;
  /** 
   * Updates the workspace header title, breadcrumbs, and optional action slots dynamically.
   * @param config Configuration object containing title, optional breadcrumbs array, and action node.
   */
  setWorkspaceHeader: (config: {
    title: string;
    breadcrumbs?: BreadcrumbItem[];
    action?: ReactNode;
  }) => void;
  /** Updates the background saving synchronization indicator status. */
  setIsSaving: (saving: boolean) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

/**
 * Provides the advanced workspace context state for dynamic header management,
 * supporting titles, breadcrumb trails, action buttons, and saving status indicators.
 * 
 * @example
 * // Example 1: Wrapping your admin layout with the workspace provider
 * export default function AdminLayout({ children }: { children: React.ReactNode }) {
 *   return (
 *     <WorkspaceProvider>
 *       <div className="flex flex-col h-screen">
 *         <Header />
 *         <main className="flex-1 overflow-y-auto">{children}</main>
 *       </div>
 *     </WorkspaceProvider>
 *   );
 * }
 */
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [pageTitle, setPageTitle] = useState<string>("Dashboard");
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [headerAction, setHeaderAction] = useState<ReactNode | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const setWorkspaceHeader = (config: {
    title: string;
    breadcrumbs?: BreadcrumbItem[];
    action?: ReactNode;
  }) => {
    setPageTitle(config.title);
    if (config.breadcrumbs) setBreadcrumbs(config.breadcrumbs);
    if (config.action !== undefined) setHeaderAction(config.action);
  };

  return (
    <WorkspaceContext.Provider
      value={{
        pageTitle,
        breadcrumbs,
        headerAction,
        isSaving,
        setWorkspaceHeader,
        setIsSaving,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

/**
 * Custom React hook to access and mutate the advanced workspace context state.
 * Throws an error if called outside of a `WorkspaceProvider`.
 * 
 * @returns The workspace context containing state values and setters.
 * 
 * @example
 * // Example 1: Simple Page Title Configuration inside useEffect
 * const { setWorkspaceHeader } = useWorkspace();
 * useEffect(() => {
 *   setWorkspaceHeader({ title: "Orodha ya Wanafunzi" });
 * }, [setWorkspaceHeader]);
 * 
 * @example
 * // Example 2: Comprehensive Usage with Breadcrumbs and Action Buttons
 * const { setWorkspaceHeader } = useWorkspace();
 * useEffect(() => {
 *   setWorkspaceHeader({
 *     title: "Sekondari ya Alpha",
 *     breadcrumbs: [
 *       { label: "Dashboard", href: "/admin" },
 *       { label: "Shule", href: "/admin/schools" },
 *       { label: "Sekondari ya Alpha" }
 *     ],
 *     action: (
 *       <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold">
 *         Hifadhi Mabadiliko
 *       </button>
 *     )
 *   });
 * }, [setWorkspaceHeader]);
 * 
 * @example
 * // Example 3: Toggling the Global Saving Indicator during Async Mutations
 * const { setIsSaving } = useWorkspace();
 * const handleFormSubmit = async () => {
 *   setIsSaving(true);
 *   await saveDataToServer();
 *   setIsSaving(false);
 * };
 */
export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must used inside WorkspaceProvider");
  }
  return context;
}