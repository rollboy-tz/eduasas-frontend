import { useClassContext } from "@/shared/contexts";
import { useWorkspace } from "@/shared/providers";
import { useEffect } from "react";

export const ClassStudentsPage = () => {
    const { classProfile } = useClassContext();
    const { setWorkspaceHeader } = useWorkspace();

    useEffect(() => {
        if (classProfile?.displayName) {
            document.title = `${classProfile.displayName} - Students | EduAsas`;
        }
    }, [classProfile?.displayName]);

    useEffect(() => {
        if (classProfile?.displayName) {
            setWorkspaceHeader({ title: `${classProfile.displayName} - Students` });
        }
    }, [setWorkspaceHeader]);

    if (!classProfile) return null;

    return (
        <div>
            Class Students
        </div>
    )
}