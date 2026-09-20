import { SchoolContextLayout, SchoolDashboardLayout } from "@/layouts";
import { SchoolDashboard } from "@/pages/school";
import { ClassesRoutes } from "@/pages/school/classes";
import { StudentEnrollPage, StudentsRoutes } from "@/pages/school/Students";
import { StaffRoutes } from "@/pages/school/staffs";


export const SchoolContextRoutes = [
    {
        element: <SchoolContextLayout />,
        children: [
            {
                path: "/students/new",
                element: <StudentEnrollPage />
            },
            { 
                element: <SchoolDashboardLayout />,
                children: [
                    { path: "/dashboard", element: <SchoolDashboard /> },
                    ...ClassesRoutes,
                    ...StudentsRoutes,
                    ...StaffRoutes,
                ]
            }
        ]

    }
]