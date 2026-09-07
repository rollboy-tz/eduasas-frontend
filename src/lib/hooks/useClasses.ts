/**
 * @fileoverview School Classes Engine
 * @description Inasimamia utambulisho, usajili, uhariri na orodha ya madarasa katika shule.
 * @author Injinia Rollboy (EduAsas Tech)
 * @version 1.2.0
 */



import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ClassProfile, MasterClass, SchoolClass } from "@/types";
import { apiFetch, apiMutation } from "@/lib/api";

const CLASSES_KEY = ["school-classes"];


/**
 * ### MasterClassesHookReturn
 * @property {MasterClass[]} classes - Orodha ya madarasa yaliyopangwa.
 * @property {boolean} isLoading - Hali ya upakiaji.
 * @property {any} isError - Hitilafu zilizotokea.
 */

/**
 * ### useMasterClasses
 * Hook ya kitalamu kwa ajili ya kuvuta orodha ya Master Classes kutoka kwenye mfumo.
 * @returns {MasterClassesHookReturn}
 */
export function useMasterClasses() {
  // 1. Fetching (GET)
  const { data, error, isLoading } = useQuery<MasterClass[]>({
    queryKey: ['master-classes', 'discovery'],
    queryFn: () => apiFetch<MasterClass[]>("/school/academic/classes/discovery"),
    
    // Performance: Madarasa hayabadiliki kila sekunde, 
    // tunaiweka cache iwe ya muda mrefu (dakika 30)
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
  });

  // 2. Logic: Hakikisha data ipo, kama haipo tunarudisha array tupu
  // Hapa unaweza kuongeza sort logic kama kuna kipaumbele cha madarasa (e.g. Form 1 -> Form 4)
  const classes = data ?? [];

  return {
    classes,
    isLoading,
    isError: error,
  };
}


/**
 * ### useSchoolClasses
 * Hook ya kusimamia orodha ya madarasa yote ya shule (Fetch List & Create).
 */
export function useSchoolClasses() {
  const queryClient = useQueryClient();

  // 1. Fetching Classes List (GET)
  const { data, isLoading, error } = useQuery<SchoolClass[]>({
    queryKey: CLASSES_KEY,
    queryFn: () => apiFetch<SchoolClass[]>("/school/academic/classes"),
    staleTime: 1000 * 60 * 5, // Cache ya dakika 5
  });

  // 2. Mutation Engine (CREATE CLASS)
  const createMutation = useMutation({
    mutationFn: (payload: { classCode: string }) =>
      apiMutation("post", "/school/academic/classes", payload),

    onSuccess: () => queryClient.invalidateQueries({ queryKey: CLASSES_KEY }),
  });

  const createClass = async (classCode: string) => {
    return await createMutation.mutateAsync({ classCode });
  };

  return {
    classes: data || [],
    isLoading,
    isError: error,
    createClass,
    isCreating: createMutation.isPending,
    refresh: () => queryClient.invalidateQueries({ queryKey: CLASSES_KEY }),
  };
}

/**
 * ### useClassProfile
 * Hook ya kuvuta Class Profile mahususi na kufanya edits/updates.
 * @param classId - ID au Identifier ya Class iliyotokana na classCode
 */
export function useClassProfile(classId?: string) {
  const queryClient = useQueryClient();
  const PROFILE_KEY = ["school-class-profile", classId];

  // 1. Fetching Single Class Profile (GET)
  const { data, isLoading, error } = useQuery<ClassProfile>({
    queryKey: PROFILE_KEY,
    queryFn: () => apiFetch<ClassProfile>(`/school/academic/classes/${classId}`),
    enabled: !!classId, // Inapiga API iwapo tu classId ipo
    staleTime: 1000 * 60 * 2,
  });

  // 2. Mutation Engine (UPDATE / EDIT CLASS)
  const updateMutation = useMutation({
    mutationFn: (payload: any) =>
      apiMutation("patch", `/school/academic/classes/${classId}`, payload),

    onSuccess: () => {
      // Refresh zote mbili: profile ya sasa na orodha kuu ya madarasa
      queryClient.invalidateQueries({ queryKey: PROFILE_KEY });
      queryClient.invalidateQueries({ queryKey: CLASSES_KEY });
    },
  });

  const updateClass = async (payload: any) => {
    return await updateMutation.mutateAsync(payload);
  };

  return {
    classProfile: data,
    isLoading,
    isError: error,
    updateClass,
    isUpdating: updateMutation.isPending,
    refreshProfile: () =>
      queryClient.invalidateQueries({ queryKey: PROFILE_KEY }),
  };
}