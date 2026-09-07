/**
 * @fileoverview Grading Rules Engine
 * @description Inavuta mifumo ya ufaulu (Necta/Standard) inayokubaliwa na shule husika.
 * Inatumia Partitioned Caching kulingana na shule na hali ya uanachama (Status).
 * @author Injinia Rollboy (EduAsas Tech)
 * @version 2.0.0
 */

"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/api-fetch";
import { CompatibleGradingRule,  UserAffiliatedSchool } from "@/types";
import { useMemo } from "react";

/**
 * ### GradingRulesHookReturn
 * @property {CompatibleGradingRule[]} globalRules - Mifumo ya ufaulu inayopatikana.
 * @property {boolean} isLoading - Hali ya upakiaji.
 * @property {boolean} isFetching - Hali ya background sync.
 * @property {any} error - Hitilafu zozote.
 * @property {Function} refresh - Kulazimisha sync na server.
 */

/**
 * ### useCompatibleGrading
 * Hook ya kitalamu ya kuvuta grading rules kulingana na context ya shule.
 * @param {UserAffiliatedSchool} school - Object ya shule iliyochaguliwa.
 * @returns {GradingRulesHookReturn}
 */
export const useCompatibleGrading = (school?: UserAffiliatedSchool) => {
  const queryClient = useQueryClient();

  // 1. Dynamic Key & Endpoint Generation
  const { queryKey, endpoint } = useMemo(() => {
    const schoolUId = school?.schoolUId;
    const status = school?.status?.toUpperCase();

    // Key hii inazuia cache ya shule A isichanganyike na shule B
    const key = ['grading-rules', schoolUId, status];

    // Endpoint logic
    const path = status === "PENDING" 
      ? `/academic/grading/compatible?schoolUId=${schoolUId}` 
      : `/academic/grading/compatible`;

    return { queryKey: key, endpoint: path };
  }, [school?.schoolUId, school?.status]);

  // 2. Fetching (GET)
  const { data, error, isLoading, isFetching } = useQuery<CompatibleGradingRule[]>({
    queryKey,
    queryFn: () => apiFetch<CompatibleGradingRule[]>(endpoint),
    // Query itafanya kazi tu kama schoolUId ipo
    enabled: !!school?.schoolUId,
    staleTime: 1000 * 60 * 5, // Dakika 5
    gcTime: 1000 * 60 * 10,
  });

  return {
    globalRules: data || [],
    isLoading,
    isFetching,
    error,
    refresh: () => queryClient.invalidateQueries({ queryKey })
  };
};