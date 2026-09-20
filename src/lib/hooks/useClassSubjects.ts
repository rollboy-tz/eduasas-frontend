/**
 * @file useClassSubjects.ts
 * @description Enterprise hook for managing class curriculum subjects, bulk class assignments, 
 * re-assignments, and individual subject stream mappings.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, apiMutation } from "@/lib/api";
import type { ApiResponse } from "@/lib/api/api-respone";

export interface ClassSubjectItem {
    id: string;
    schoolSubjectId: string;
    name: string | null;
    code: string | null;
    category: string;
    stream: {
        id: string;
        name: string;
        code: string;
    } | null;
    isActive: boolean;
    createdAt: Date;
}

export interface ClassSubjectsResponse {
    classInfo: {
        id: string;
        classCode: string;
        classCategory: string;
        status: string;
    };
    subjectsCount: number;
    subjects: ClassSubjectItem[];
}

export interface AssignClassSubjectsPayload {
    schoolSubjectIds: string[];
}

export interface ReassignClassSubjectsPayload {
    classSubjectIds: string[];
}

export interface ReassignStreamPayload {
    classSubjectId: string;
    newStreamId: string | null;
}

export function useClassSubjects(classId?: string) {
    const queryClient = useQueryClient();
    const queryKey = ["class-subjects-config", classId];

    // 1. GET: Fetch class subjects (apiFetch unwraps ApiResponse directly to ClassSubjectsResponse)
    const {
        data: response,
        isLoading,
        isError,
        refetch
    } = useQuery<ClassSubjectsResponse, Error>({
        queryKey,
        queryFn: () => apiFetch<ClassSubjectsResponse>(`/school/classes/${classId}/subjects`),
        enabled: !!classId,
        staleTime: 30 * 1000,
    });

    // 2. POST: Assign school subjects to the class (apiMutation returns ApiResponse<unknown>)
    const assignSubjectsMutation = useMutation<ApiResponse<unknown>, Error, AssignClassSubjectsPayload>({
        mutationFn: (payload) => 
            apiMutation<unknown, AssignClassSubjectsPayload>("POST", `/school/classes/${classId}/subjects`, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });

    // 3. PATCH: Re-assign class subjects
    const reassignSubjectsMutation = useMutation<ApiResponse<unknown>, Error, ReassignClassSubjectsPayload>({
        mutationFn: (payload) => 
            apiMutation<unknown, ReassignClassSubjectsPayload>("PATCH", `/schools/classes/${classId}/subjects/re-assign`, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });

    // 4. PATCH: Reassign a class subject to a specific stream (or null)
    const reassignStreamMutation = useMutation<ApiResponse<unknown>, Error, ReassignStreamPayload>({
        mutationFn: (payload) => 
            apiMutation<unknown, ReassignStreamPayload>("PATCH", `/schools/classes/subjects/reassign-stream`, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });

    return {
        classInfo: response?.classInfo,
        subjectsCount: response?.subjectsCount ?? 0,
        subjects: response?.subjects || [],
        isLoading,
        isError,
        refresh: refetch,
        
        assignSubjects: assignSubjectsMutation.mutateAsync,
        isAssigning: assignSubjectsMutation.isPending,
        
        reassignSubjects: reassignSubjectsMutation.mutateAsync,
        isReassigning: reassignSubjectsMutation.isPending,
        
        reassignStream: reassignStreamMutation.mutateAsync,
        isReassigningStream: reassignStreamMutation.isPending,
    };
}