import { InputLabel } from "@/components/atoms";
import { EduButton } from "@/components/elements";
import { EduInput } from "@/components/fields/EduInput";
import { showFeedback } from "@/components/modals";
import { useToast } from "@/lib";
import { ApiResponse, isApiError } from "@/lib/api"
import { useClassSections } from "@/lib/hooks"
import { SectionsMutation } from "@/types";
import { useState } from "react";
import { JSX } from "react/jsx-runtime";

interface AddSectionFormProps {
    classId: string;
    onSuccess?: (res: ApiResponse) => void;
    onError?: (err: any) => void;
}

export const AddSectionForm = ({ onSuccess, onError, classId }: AddSectionFormProps): JSX.Element => {

    const { createClassSection, isCreating, refresh } = useClassSections(classId);
    const toast = useToast();
    const [data, setData] = useState<SectionsMutation>({
        name: "",
        capacity: 45,
        streamId: null,
        classTeacherId: null
    })

    const createSection = async () => {
        if (!data.name || data.name.trim() === "") {
            toast.show({ message: "Please enter section name", type: "error" });
            return;
        };

        const loadingToast = toast.show({ message: "Creating section...", type: "loading" })

        try {
            const response = await createClassSection(data);

            if (response.status === "success") {
                refresh()
                
                if (onSuccess) {
                    onSuccess(response)
                } else {
                    showFeedback({
                        title: "Section created",
                        type: "success",
                        message: response.message || "Sections addedd successfully to your class profile"
                    })
                }
            }

        } catch (err) {
            if (isApiError(err)) {
                if (onError) {
                    onError(err)
                } else {
                    showFeedback({
                        type: "error",
                        title: `Action failed (${err.statusCode})`,
                        message: err.message || "Unable to create class section please retry",
                        actions: [
                            { label: "Cancel", onClick: () => { }, variant: "secondary" },
                            { label: "Retry", onClick: () => createSection() }
                        ]
                    })
                }
            } else {
                toast.show({ message: "Unexpected error occured", type: "error" })
                console.error(err)
            }
            
        } finally {
            toast.dismiss(loadingToast)
        }

    }

    return (
        <div className="w-full p-2">
            <div className="w-full flex flex-col gap-2.5">
                <div className="space-y-2">
                    <InputLabel label="Section name" required />
                    <EduInput
                        type="text"
                        value={data?.name}
                        onChange={(val) => setData({ ...data, name: val })}

                    />
                </div>

                <div className="space-y-2">
                    <InputLabel label="Section name" required />
                    <EduInput
                        type="number"
                        maxValue={3}
                        value={data?.capacity.toString() ?? "45"}
                        onChange={(val) => {
                            if (!val && val.trim() === "") return
                            const cap = Number(val) ?? 45
                            setData({ ...data, capacity: cap })
                        }}

                    />
                </div>
                <EduButton
                    isLoading={isCreating}
                    onClick={createSection}
                    loadingText="Creating section..."
                >
                    Create Section
                </EduButton>
            </div>

        </div>
    )
}