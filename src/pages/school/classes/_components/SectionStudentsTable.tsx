
import { EduButton } from "@/components/elements";
import { useSectionStudents } from "@/lib/hooks"
import { SectionStudent } from "@/types";
import { AlertCircle, RefreshCcw } from "lucide-react";



export const SectionStudentsTable = ({ sectionId }: { sectionId?: string, studentCount?: number; }) => {
    const { sectionStudents, loadingStudents, isError, refreshStudents } = useSectionStudents(sectionId);

    if (isError && !sectionStudents && !loadingStudents) return (
        <div className="w-full place-items-center min-h-50">
            <div className="flex flex-col w-full items-center max-w-md text-center">
                <div className="text-rose-500 bg-rose-50 rounded-full p-4 shadow-2xs my-5"><AlertCircle className="h-8 w-8" /></div>
                <h3 className="my-1 font-bold text-gray-700">Students loading failed</h3>
                <p className="text-sm font-medum text-gray-500 mt-2">Students loading failed. Try reloding by hiting button bellow, please contact support if issue persist.</p>
                <EduButton
                    icon={RefreshCcw}
                    onClick={() => refreshStudents()}
                    className="mt-5"
                >
                    Reload students
                </EduButton>
            </div>
        </div>
    )

    return (
        <div>
            {loadingStudents ? (<>Loading students</>
            ) : (
                <div>
                    {sectionStudents?.map((student, i) => (
                        <StudentListCard  key={i} student={student}/>
                    ))}
                </div>
            )}
        </div>
    )
}


export const StudentListCard = ({ student }: { student: SectionStudent }) => {
    return (
        <div className="w-full bg-white p-2 cursor-pointer hover:bg-gray-100/70 rounded-md">
            <div className="flex items-center gap-2.5">

                {/* Avatar */}
                <div className="h-10 w-10 rounded-full bg-emerald-100">

                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col">
                    <span className="text-sm font-bold text-gray-800" >{student.firstName +" " + student.lastName}</span>
                    <span className="text-[11px] font-medium text-gray-400">{student.gender + " - " + student.admissionNo}</span>
                </div>
            </div>
        </div>
    )
}