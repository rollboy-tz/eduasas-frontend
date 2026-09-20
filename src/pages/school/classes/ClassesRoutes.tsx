import { ClassesPage } from "./ClassPage"
import { ClassLayout } from "./ClassLayout"
import { ClassProfilePage } from "./ClassProfilePage"
import { SectionProfile } from "./SectionProfilePage"
import { ClassStudentsPage } from "./ClassStudentsPage"
import { ClassSubjectsPage } from "./ClassSubjectsPage"
import { StreamsPage } from "./ClassStreamsPage"
import { ClassSectionsPge } from "./ClassSectionsPage"

export const ClassesRoutes = [
    {
        path: "/classes",
        element: <ClassesPage />,
    },
    {
        element: <ClassLayout />,
        children: [
            { path: "/classes/:code", element: <ClassProfilePage /> },
            { path: "/classes/:code/streams", element: <StreamsPage /> },
            { path: "/classes/:code/students", element: <ClassStudentsPage /> },
            { path: "/classes/:code/subjects", element: <ClassSubjectsPage /> },
            { path: "/classes/:code/sections", element: <ClassSectionsPge/> },
            { path: "/classes/:code/sections/:sectionId", element: <SectionProfile /> }
        ]
            
    }
]