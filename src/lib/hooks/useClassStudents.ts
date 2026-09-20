/**
 * @file useClassStudents.ts
 * @description Enterprise hook for managing class student rosters, query filtering, 
 * bulk stream/section modifications, and student-subject cross-reference queries.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, apiMutation } from "@/lib/api";
import type { ApiResponse } from "@/lib/api/api-respone";
import type { ClassStudentItem, StudentSubject } from "@/types";

export interface StudentQueryParams {
    search?: string;
    sectionId?: string;
    stream?: string;
    academicYeraId?: string;
    isCurrent?: boolean;
}

export type AssignmentStrategy = "DIRECT" | "FROM_STREAM" | "SECTION_STREAM" | "GENERAL_ONLY";

export interface AssignStudentSubjectsPayload {
    enrollmentsIds: string[];
    classSubjectIds?: string[];
    classId?: string;
    streamId?: string;
    strategy: AssignmentStrategy;
}

export interface ReassignStudentSubjectsPayload {
    enrollmentIds: string[];
    newClassSubjectIds: string[];
}

export interface UpdateStreamPayload {
    studentsIds: string[];
    newStreamId: string;
}

export interface UpdateSectionPayload {
    studentsIds: string[];
    newSectionId: string;
}

export function useClassStudents(classId?: string, params?: StudentQueryParams) {
    const queryClient = useQueryClient();
    const queryKey = ["class-students", classId, params];

    // 1. GET: Fetch class students (apiFetch unwraps ApiResponse directly to ClassStudentItem[])
    const {
        data: students = [],
        isLoading,
        isError,
        refetch
    } = useQuery<ClassStudentItem[], Error>({
        queryKey,
        queryFn: () => {
            const searchParams = new URLSearchParams();
            if (params?.search) searchParams.append("search", params.search);
            if (params?.sectionId) searchParams.append("sectionId", params.sectionId);
            if (params?.stream) searchParams.append("stream", params.stream);
            if (params?.academicYeraId) searchParams.append("academicYeraId", params.academicYeraId);
            if (params?.isCurrent !== undefined) searchParams.append("isCurrent", String(params.isCurrent));

            const queryString = searchParams.toString();
            const endpoint = `/school/classes/${classId}/students${queryString ? `?${queryString}` : ""}`;
            
            return apiFetch<ClassStudentItem[]>(endpoint);
        },
        enabled: !!classId,
        staleTime: 30 * 1000,
    });

    // 2. PATCH: Bulk update student stream within class (apiMutation returns ApiResponse<unknown>)
    const updateStreamMutation = useMutation<ApiResponse<unknown>, Error, UpdateStreamPayload>({
        mutationFn: (payload) => 
            apiMutation<unknown, UpdateStreamPayload>("PATCH", `/school/classes/${classId}/students/stream`, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["class-students", classId] });
        },
    });

    // 3. PATCH: Bulk update student section within class
    const updateSectionMutation = useMutation<ApiResponse<unknown>, Error, UpdateSectionPayload>({
        mutationFn: (payload) => 
            apiMutation<unknown, UpdateSectionPayload>("PATCH", `/school/classes/${classId}/students/section`, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["class-students", classId] });
        },
    });

    // 4. POST: Bulk assign subjects to multiple students
    const assignSubjectsMutation = useMutation<ApiResponse<unknown>, Error, AssignStudentSubjectsPayload>({
        mutationFn: (payload) => 
            apiMutation<unknown, AssignStudentSubjectsPayload>("POST", `/school/classes/${classId}/students/assign-subjects`, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["class-students", classId] });
        },
    });

    // 5. PUT: Re-assign students to subjects
    const reassignSubjectsMutation = useMutation<ApiResponse<unknown>, Error, ReassignStudentSubjectsPayload>({
        mutationFn: (payload) => 
            apiMutation<unknown, ReassignStudentSubjectsPayload>("PUT", `/school/classes/${classId}/students/reassign-subjects`, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["class-students", classId] });
        },
    });

    return {
        students,
        isLoading,
        isError,
        refresh: refetch,
        
        updateStudentsStream: updateStreamMutation.mutateAsync,
        isUpdatingStream: updateStreamMutation.isPending,
        
        updateStudentsSection: updateSectionMutation.mutateAsync,
        isUpdatingSection: updateSectionMutation.isPending,
        
        assignStudentSubjects: assignSubjectsMutation.mutateAsync,
        isAssigningSubjects: assignSubjectsMutation.isPending,
        
        reassignStudentSubjects: reassignSubjectsMutation.mutateAsync,
        isReassigningSubjects: reassignSubjectsMutation.isPending,
    };
}

/**
 * Hook maalum ya kuvuta masomo ya mwanafunzi mmoja ndani ya darasa
 * GET /school/classes/:classId/students/:enrollmentId/subjects
 */
export function useStudentClassSubjects(classId?: string, enrollmentId?: string) {
    const {
        data: subjects = [],
        isLoading,
        isError,
        refetch
    } = useQuery<StudentSubject[], Error>({
        queryKey: ["student-class-subjects", classId, enrollmentId],
        queryFn: () => apiFetch<StudentSubject[]>(`/school/classes/${classId}/students/${enrollmentId}/subjects`),
        enabled: !!classId && !!enrollmentId,
        staleTime: 30 * 1000,
    });

    return { subjects, isLoading, isError, refresh: refetch };
}

/**
 * Hook maalum ya kuvuta wanafunzi wote wanaosoma somo fulani ndani ya darasa
 * GET /school/classes/:classId/subjects/:classSubjectsId/students
 */
export function useSubjectClassStudents(classId?: string, classSubjectsId?: string) {
    const {
        data: students = [],
        isLoading,
        isError,
        refetch
    } = useQuery<ClassStudentItem[], Error>({
        queryKey: ["subject-class-students", classId, classSubjectsId],
        queryFn: () => apiFetch<ClassStudentItem[]>(`/school/classes/${classId}/subjects/${classSubjectsId}/students`),
        enabled: !!classId && !!classSubjectsId,
        staleTime: 30 * 1000,
    });

    return { students, isLoading, isError, refresh: refetch };
}