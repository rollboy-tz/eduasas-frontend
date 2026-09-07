/**
 * @fileoverview School Classes Engine
 * @description Inasimamia utambulisho, usajili, uhariri na orodha ya madarasa katika shule.
 * @author Injinia Rollboy (EduAsas Tech)
 * @version 1.2.0
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ClassProfile, ClassSections, SectionsMutation } from "@/types";
import { apiFetch, apiMutation } from "@/lib/api";



/**
 * ### useClassSections
 * Hook ya kusimamia orodha ya madarasa yote ya shule (Fetch List & Create).
 */
export function useClassSections(classId?: string) {
  const CLASS_SECTIONS_KEY = ["class-sections", classId];
  const queryClient = useQueryClient();

  // 1. Fetching Classes List (GET)
  const { data, isLoading, error } = useQuery<ClassSections[]>({
    queryKey: CLASS_SECTIONS_KEY,
    queryFn: () => apiFetch<ClassSections[]>(`/school/classes/${classId}/sections`),
    enabled: !!classId,
    staleTime: 1000 * 60 * 5, // Cache ya dakika 5
  });

  // 2. Mutation Engine (CREATE CSECTION)
  const createMutation = useMutation({
    mutationFn: (payload: { classCode: string }) =>
      apiMutation("post", `/school/classes/${classId}/sections`, payload),

    onSuccess: () => queryClient.invalidateQueries({ queryKey: CLASS_SECTIONS_KEY }),
  });

  const createClassSection = async (classCode: string) => {
    return await createMutation.mutateAsync({ classCode });
  };

  return {
    classSections: data || [],
    isLoading,
    isError: error,
    createClassSection,
    isCreating: createMutation.isPending,
    refresh: () => queryClient.invalidateQueries({ queryKey: CLASS_SECTIONS_KEY }),
  };
}

/**
 * ### useClassProfile
 * Hook ya kuvuta Section Profile mahususi na kufanya edits/updates.
 * @param classId - ID au Identifier ya Class iliyotokana na classCode
 */
export function useSectionProfile(sectionId?: string) {
  const queryClient = useQueryClient();
  const SECTION_PROFILE_KEY = ["class-section-profile", sectionId];

  // 1. Fetching Single Section Profile (GET)
  const { data, isLoading, error } = useQuery<ClassProfile>({
    queryKey: SECTION_PROFILE_KEY,
    queryFn: () => apiFetch<ClassProfile>(`/school/classes/sections/${sectionId}`),
    enabled: !!sectionId, // Inapiga API iwapo tu classId ipo
    staleTime: 1000 * 60 * 2,
  });

  // 2. Mutation Engine (UPDATE / EDIT CLASS)
  const updateMutation = useMutation({
    mutationFn: (payload: SectionsMutation) =>
      apiMutation("patch", `/school/classes/sections/${sectionId}`, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SECTION_PROFILE_KEY });
    },
  });

  const updateSection = async (payload: SectionsMutation ) => {
    return await updateMutation.mutateAsync(payload);
  };

  return {
    SectionProfile: data,
    isLoading,
    isError: error,
    updateSection,
    isUpdating: updateMutation.isPending,
    refreshProfile: () =>
      queryClient.invalidateQueries({ queryKey: SECTION_PROFILE_KEY }),
  };
}