import { useSubjectsAllocations } from "@/lib/hooks";

export const StaffAllocationView = () => {
    useSubjectsAllocations();

    return (
        <div>
            Staff Allocation
        </div>
    )
}