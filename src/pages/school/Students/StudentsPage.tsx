import { useStudents } from "@/lib/hooks"

export const StudentsPage = () => {

    const { students } = useStudents();
    console.log(students)
    return (
        <div>
            <h1>Students page</h1>
        </div>
    )
}