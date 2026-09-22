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
import DashLayout from "@/components/layout/DashLayout";

interface WorkspaceLayoutProps {
    menuData: MenuGroup[]
}

export const HomeDashboardLayout = ({ menuData }: WorkspaceLayoutProps) => {
    return (
        <WorkspaceProvider>
            <SidebarProvider>
                <SearchProvider>
                    <ProfilePanelProvider>
                        <GlobalSearch />
                        <DashLayout>
                            <Outlet />
                        </DashLayout>
                    </ProfilePanelProvider>
                </SearchProvider>
            </SidebarProvider>
        </WorkspaceProvider>
    );
}