import { SpreadsheetUpload } from "@/components/elements";

interface ClassDataProp {
    classId: string;
    sectionId: string;
    streamId?: string;
}


interface StudentsUploadsForm {
    onClose: () => void;
    classData?: ClassDataProp;
}

export const StudentsUploadsForm = ({ }: StudentsUploadsForm ) => {
    return (
        <div className="w-full min-h-[540px] rounded-2xl flex flex-col justify-between py-5 px-2 sm:px-5">
            <SpreadsheetUpload  onExtracted={(data) => console.log(data)}/>
        </div>
    )
}