import { useClassContext } from "@/shared/contexts";
import { useWorkspace } from "@/shared/providers";
import { useEffect } from "react";

export const StreamsPage = () => {
    const { classProfile } = useClassContext();
    const { setWorkspaceHeader } = useWorkspace();


    useEffect(() => {
        if (classProfile?.displayName) {
            document.title = `${classProfile.displayName} - Streams | EduAsas`;
        }
    }, [classProfile?.displayName]);

    useEffect(() => {
        if (classProfile?.displayName) {
            setWorkspaceHeader({ title: `${classProfile.displayName} - Streams` });
        }
    }, [setWorkspaceHeader]);

    if (!classProfile) return null;
    return (
        <div>
            Streams
        </div>
    )
}