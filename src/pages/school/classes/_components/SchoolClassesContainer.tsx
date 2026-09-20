import { useSchoolClasses } from "@/lib/hooks"
import { ClassCard } from "./ClassCard";

export const ClassesWrapper = () => {

    const { classes } = useSchoolClasses();
    return (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4 mt-2.5">
            {classes.map((schoolClass) => (
                <ClassCard key={schoolClass.id} schoolClass={schoolClass} />
            ))}
        </div>
    )
}