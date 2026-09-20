
import { InputLabel } from "@/components/atoms";
import { EduButton } from "@/components/elements";
import { useMasterClasses, useSchoolClasses } from "@/lib/hooks";
import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { isApiError, ApiResponse, ApiError } from "@/lib/api";
import { useToast } from "@/lib/store";
import { EduSelect } from "@/components/fields/EduSelect";
import { showFeedback } from "@/components/modals";

interface AddClassForProps {
    onSuccess: (Response: ApiResponse) => void;
    onError?: (error: ApiError) => void;
}

export const AddClassForm = ( { onSuccess, onError }: AddClassForProps ) => {

    const { classes } = useMasterClasses();
    const { createClass, isCreating } = useSchoolClasses();
    const toast = useToast();
    const [classCode, setClassCode] = useState<string>()
    
    if (!classes) return null

    const handleSubmit = async () => {

        const loadingId = toast.show({ message: "Adding Class...", type: "loading"})

        try {
           const response = await createClass(classCode!)
           if(response.status === "success") {
            onSuccess(response)
           }
        } catch(error) {
            if(isApiError(error)) {
                if(onError){
                    onError(error);
                } else {
                    showFeedback({
                        type: "error",
                        title: `Class creation failed (${error.statusCode})`,
                        message: error.message || "Unexpectedly class creation failed please try again",
                        actions: [
                            { label: "Ok", variant: "secondary", onClick: () => {} },
                            { label: "Retry", onClick: () => handleSubmit(), variant: "primary" }
                        ]
                    })
                }
            }
            
        } finally { toast.dismiss(loadingId)  }
    }

    return (
        <div className="flex flex-col gap-5 rounded-lg bg-white p-4">

            {/* Header */}
            <div className="space-y-1">

                <h2 className="text-base font-semibold text-slate-900">
                    Create Class
                </h2>

                <p className="text-sm leading-5 text-gray-500">
                    Select a class level to add it to your school workspace.
                </p>

            </div>



            {/* Form */}
            <div className="flex flex-col gap-4">

                <div className="flex flex-col gap-1.5">

                    <InputLabel
                        label="Select class"
                        htmlFor="class"
                        required
                    />

                    <EduSelect
                        options={classes.map(c => ({ label: c.displayName, value: c.classCode }))}
                        size="lg"
                        labelKey="label"
                        valueKey="value"
                        value={classCode}
                        placeholder="Select class"
                        className="border border-slate-200"
                        onChange={(value) => {setClassCode(value as string)}}
                    />

                </div>

                <div className="mt-2 flex items-start gap-2 rounded-md bg-blue-50/60 px-3 py-2.5">
                    <AlertCircle
                        size={15}
                        className="mt-0.5 shrink-0 text-blue-600"
                    />

                    <div className="text-sm font-normal text-gray-500">
                        <span>
                            Class naming conventions can be tailored to your institution’s preferences in the workspace settings to reduce confusion. Additional features will become available once the class is created.
                        </span>{" "}
                        <a
                            href="/settings/classes"
                            className="font-medium text-blue-600 underline hover:text-blue-700 inline-flex items-center gap-0.5"
                        >
                            Learn more
                        </a>
                    </div>
                </div>


                <EduButton
                    loadingText="Creatingn"
                    isLoading={isCreating}
                    onClick={handleSubmit}
                    className="
                        h-10
                        w-full
                        rounded-lg
                        text-sm
                        font-semibold
                    "
                >
                    Create Class
                </EduButton>

            </div>


        </div>
    );
};