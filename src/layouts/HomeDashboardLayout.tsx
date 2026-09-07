import { SidebarProvider } from "@/components/layout/SideBar";
import type { MenuGroup } from "@/types";
import { SearchProvider } from "@/shared/contexts";
import { GlobalSearch } from "@/components/elements";
import { Header } from "@/components/layout/Header";
import { SidebarLayout } from "@/components/layout/SideBar/ui";
import ProfilePanel from "@/components/layout/ProfilePanel/ProfilePanel";
import { ProfilePanelProvider } from "@/components/layout/ProfilePanel";
import { WorkspaceProvider } from "@/shared/providers";
import { Outlet } from "react-router-dom";

interface WorkspaceLayoutProps {
    menuData: MenuGroup[];
    inContext?: boolean;
}

export const HomeDashboardLayout = ({ menuData }: WorkspaceLayoutProps) => {
    return (
        <WorkspaceProvider>
            <SidebarProvider>
                <SearchProvider>
                    <ProfilePanelProvider>
                        <GlobalSearch />
                        <div className="flex flex-1 flex-col overflow-hidden relative">
                            <SidebarLayout data={menuData} header={<Header />}>
                                <Outlet />
                            </SidebarLayout>
                            <ProfilePanel />
                        </div>
                    </ProfilePanelProvider>
                </SearchProvider>
            </SidebarProvider>
        </WorkspaceProvider>
    );
}