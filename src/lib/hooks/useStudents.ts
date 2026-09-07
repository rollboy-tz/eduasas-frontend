/**
 * @fileoverview Students Management Engine
 * @description Inasimamia usajili (enrollment), utambulisho na orodha ya wanafunzi katika shule.
 * @author Injinia Rollboy (EduAsas Tech)
 * @version 1.2.0
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, apiMutation } from "@/lib/api";
import { EnrollStudentOutput, EnrollStudentResult } from "@/types";

const STUDENTS_KEY = ["school-students"];

/**
 * ### useStudents
 * Hook ya kusimamia orodha ya wanafunzi na usajili wa mwanafunzi mpya (Fetch List & Enroll).
 */
export function useStudents() {
  const queryClient = useQueryClient();

  // 1. Fetching Students List (GET)
  const { data, isLoading, error } = useQuery<any[]>({
    queryKey: STUDENTS_KEY,
    queryFn: () => apiFetch<any[]>("/school/students"),
    staleTime: 1000 * 60 * 5, // Cache ya dakika 5
  });

  // 2. Mutation Engine (ENROLL STUDENT)
  const enrollMutation = useMutation({
    mutationFn: (payload: EnrollStudentOutput) =>
      apiMutation<EnrollStudentResult>("post", "/school/students/enroll", payload),

    onSuccess: () => {
      // Refresh na ku-invalidate orodha kuu ya wanafunzi
      queryClient.invalidateQueries({ queryKey: STUDENTS_KEY });
    },
  });

  const enrollStudent = async (payload: EnrollStudentOutput) => {
    return await enrollMutation.mutateAsync(payload);
  };

  return {
    students: data || [],
    isLoading,
    isError: error,
    enrollStudent,
    isEnrolling: enrollMutation.isPending,
    refreshStudents: () => queryClient.invalidateQueries({ queryKey: STUDENTS_KEY }),
  };
}

/**
 * ### useStudentProfile
 * Hook ya kuvuta na kusimamia Single Student Profile mahususi.
 * @param studentId - ID ya mwanafunzi
 */
export function useStudentProfile(studentId?: string) {
  const queryClient = useQueryClient();
  const PROFILE_KEY = ["school-student-profile", studentId];

  // 1. Fetching Single Student Profile (GET)
  const { data, isLoading, error } = useQuery<any>({
    queryKey: PROFILE_KEY,
    queryFn: () => apiFetch<any>(`/school/students/${studentId}`),
    enabled: !!studentId, // Inapiga API iwapo tu studentId ipo
    staleTime: 1000 * 60 * 2,
  });

  return {
    studentProfile: data,
    isLoading,
    isError: error,
    refreshProfile: () => queryClient.invalidateQueries({ queryKey: PROFILE_KEY }),
  };
}