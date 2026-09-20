import { apiFetch } from "../api";
import { useQuery, useQueryClient } from "@tanstack/react-query";


export const useSubjectsAllocations = () => {
    const SUBJECT_ALLOCARTIONS_KEK = ["subject-allocations"]

    const { data, isLoading, error } = useQuery<any[]>({
        queryKey: SUBJECT_ALLOCARTIONS_KEK,
        queryFn: () => apiFetch("/school/staff/allocations/teacher-subjects"),
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
    })


    return {
        subjectsAllocations: data as any[] | [],
        isLoading,
        isError: error

    }
}