import { useSubjectsAllocations } from "@/lib/hooks";

export const StaffAllocationView = () => {

    const { subjectsAllocations } = useSubjectsAllocations();
    

    return (
        <div>
            Staff Allocation
        </div>
    )
}