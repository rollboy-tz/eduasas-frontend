import { 
    HomeDashboardLayout,
    ProtectedRoutesLayout
} from "@/layouts"

import {
    HomePage,
    SchoolsPage,
    SettingsPage,
    AddSchoolPage,
    SetupSchoolPage,
} from "./"
import { HomeMockData } from "@/components/layout/SideBar"


export const HomeRoutes = [
    {
        element: <ProtectedRoutesLayout />,
        children: [
            { path: "/schools/add", element: <AddSchoolPage /> },
            { path: "/schools/setup", element: <SetupSchoolPage /> },
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