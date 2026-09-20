/**
 * @file SchoolLayouts.tsx
 * @description Enterprise-grade layout components for school staff and dashboard views.
 * Manages tenant context provision, defensive loading checks, and full application shell wrapping.
 */

import { Outlet } from "react-router-dom";
import {
    SchoolContextProvider,
    useSchoolContext,
    useSchoolData,
    WorkspaceProvider
} from "@/shared/providers";
import { SidebarProvider } from "@/components/layout/SideBar";
import { SearchProvider } from "@/shared/contexts";
import { ProfilePanelProvider } from "@/components/layout/ProfilePanel";
import { EduScreenLoader, GlobalSearch } from "@/components/elements";
import { SidebarLayout } from "@/components/layout/SideBar/ui";
import ProfilePanel from "@/components/layout/ProfilePanel/ProfilePanel";
import { Header } from "@/components/layout/Header";
import { useMenuData } from "@/lib/hooks";

/**
 * SchoolContextLayout acts as the primary wrapper providing the School Context 
 * across all nested staff and administrative routes via React Router's Outlet.
 */
export const SchoolContextLayout = () => {
    return (
        <SchoolContextProvider>
            <Outlet />
        </SchoolContextProvider>
    );
};

/**
 * SchoolDashboardLayout provides a structured, responsive interface for the school dashboard.
 * It includes a sidebar, header, global search, and profile panel, all wrapped in required 
 * context providers to manage state and search compatibility across the dashboard.
 * 
 * @component
 * @returns {JSX.Element} The rendered dashboard layout container or defensive loader.
 */
export const SchoolDashboardLayout = () => {
    const { data, isLoading: loadingData } = useSchoolData();
    const { isReady, isLoading, isActive } = useSchoolContext();
    const { menuData, isLoading: menuLoading } = useMenuData("school", data?.school?.schoolUId);

    // 1. Defensive check for core school context and data readiness
    if (isLoading || loadingData || !isReady || !isActive) {
        return <EduScreenLoader loadingText="Loading context data" />;
    }

    // 2. Defensive check for dynamic menu payload readiness
    if (menuLoading) {
        return <EduScreenLoader loadingText="Loading menu data" />;
    }

    return (
        <WorkspaceProvider>
            <SidebarProvider>
                <SearchProvider>
                    <ProfilePanelProvider>
                        <GlobalSearch />
                        <SidebarLayout
                            data={menuData}
                            header={<Header />}
                        >
                            <Outlet />
                        </SidebarLayout>
                        <ProfilePanel />
                    </ProfilePanelProvider>
                </SearchProvider>
            </SidebarProvider>
        </WorkspaceProvider>
    );
};