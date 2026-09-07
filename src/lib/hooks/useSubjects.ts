/**
 * @fileoverview School Subjects Management Engine
 * @description Inasimamia orodha ya masomo, usajili wa masomo (National/Custom), 
 * na usimamizi wa lifecycle (Trash, Restore, Permanent Delete).
 * @author Injinia Rollboy (EduAsas Tech)
 * @version 1.0.0
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, apiMutation } from "@/lib/api";
import { api }  from "@/lib/api";
import { SubjectsDataResponse } from "@/types";

/**
 * ### useSubjects
 * Hook ya kusimamia masomo yote ya shule.
 */
export function useSubjects() {
  const queryClient = useQueryClient();
  const SUBJECTS_KEY = ['school-subjects'];

  // 1. GET MANAGER: Vuta kila kitu kwa mara moja
  const { data, isLoading, error } = useQuery<SubjectsDataResponse>({
    queryKey: SUBJECTS_KEY,
    queryFn: () => apiFetch<SubjectsDataResponse>("/school/academic/subjects"),
    staleTime: 1000 * 60 * 10, // Cache ya dakika 10
  });

  // 2. MUTATION ENGINE (CRUD)
  const mutation = useMutation({
    mutationFn: (args: { url: string; method: 'post' | 'patch' | 'delete'; body?: any }) => 
      api[args.method](args.url, args.body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SUBJECTS_KEY }),
  });

  /**
   * @function registerSubjects
   * @description Usajili wa masomo kwa wingi (Bulk Registration).
   */
  const registerSubjects = async (items: any[]) => {
    return await apiMutation(
      "post",
      "/school/academic/subjects/register",
      { items })
  };

  /**
   * @function trashSubject
   * @description Soft delete somo.
   */
  const trashSubject = async (recordId: string) => {
    return await mutation.mutateAsync({ 
      url: `/school/academic/subjects/trash/${recordId}`, 
      method: 'patch' 
    });
  };

  /**
   * @function restoreSubject
   * @description Komboa somo kutoka trash.
   */
  const restoreSubject = async (recordId: string) => {
    return await mutation.mutateAsync({ 
      url: `/school/academic/subjects/restore/${recordId}`, 
      method: 'patch' 
    });
  };

  /**
   * @function deletePermanent
   * @description Futa somo kabisa kwenye mfumo.
   */
  const deletePermanent = async (recordId: string) => {
    return await mutation.mutateAsync({ 
      url: `/school/academic/subjects/permanent/${recordId}`, 
      method: 'delete' 
    });
  };

  return {
    data,
    isLoading,
    isError: error,
    registerSubjects,
    trashSubject,
    restoreSubject,
    deletePermanent,
    isProcessing: mutation.isPending,
  };
}