import { DocumentEditorPage } from "@/lib/document";
import { 
    LandingPage 
} from "./";
import EditorPage from "./documents-demo";
import GradeGridEditor from "./GradeGridEditor"
export const LandingRoutes = [
    { path: "/", element: <LandingPage /> },
    { path: "/features", element: <GradeGridEditor /> },
    { path: "/documents-demo", element: <DocumentEditorPage onSave={(data) => console.log(" Handle save: ",data)} /> }
];