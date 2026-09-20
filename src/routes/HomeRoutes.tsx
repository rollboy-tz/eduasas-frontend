import { 
    HomeDashboardLayout,
    ProtectedRoutesLayout
} from "@/layouts"

import {
    HomePage,
    SchoolsPage,
    SettingsPage,
    AddSchoolPage,
    SchoolSetupPage,
    SwitchSchoolPage
} from "@/pages/main/home"
import { HomeMockData } from "@/components/layout/SideBar"

export const HomeRoutes = [
    {
        element: <ProtectedRoutesLayout />,
        children: [
            { path: "/schools/add", element: <AddSchoolPage /> },
            { path: "/schools/setup", element: <SchoolSetupPage /> },
            { path: "/schools/switch-workspace", element: <SwitchSchoolPage /> },
            {
                element: <HomeDashboardLayout menuData={HomeMockData} />,
                children: [
                    { path: "/home", element: <HomePage /> },
                    { path: "/schools", element: <SchoolsPage /> },
                    { path: "/settings", element: <SettingsPage /> }
                ]
            }
        ]
    }
]