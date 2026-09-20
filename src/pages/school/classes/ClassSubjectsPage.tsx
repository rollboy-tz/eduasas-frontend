import { useClassContext } from "@/shared/contexts";
import { useWorkspace } from "@/shared/providers";
import { useEffect } from "react";

export const ClassSubjectsPage = () => {
    const { classProfile } = useClassContext();
    const { setWorkspaceHeader } = useWorkspace();

    useEffect(() => {
        if (classProfile?.displayName) {
            document.title = `${classProfile.displayName} - Subjects | EduAsas`;
        }
    }, [classProfile?.displayName]);

    useEffect(() => {
        if (classProfile?.displayName) {
            setWorkspaceHeader({ title: `${classProfile.displayName} - Subjects` });
        }
    }, [setWorkspaceHeader]);

    if (!classProfile) return null;

    return (
        <div>
            Class Students
        </div>
    )
}