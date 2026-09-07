/**
 * @fileoverview School Categories Query Hook
 * @description Fetches and caches public school categories directly using TanStack Query's 
 * built-in cache engine, eliminating external global stores (Zustand) for optimal performance.
 * @author Injinia Rollboy (EduAsas Tech)
 * @version 3.0.0
 */

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/api-fetch";
import { SchoolCategory } from "@/types";

/**
 * @interface CategoriesHookReturn
 * @description Contract defining the return structure of the useCategories hook.
 */
interface CategoriesHookReturn {
  categories: SchoolCategory[];
  isLoading: boolean;
  error: unknown;
}

/**
 * @function useCategories
 * @description
 * Enterprise-grade custom hook for fetching and caching school categories 
 * directly via TanStack Query. 
 * 
 * Data is marked as fresh for 1 hour (`staleTime`) and retained in memory 
 * for 2 hours (`gcTime`), completely avoiding redundant network requests 
 * and external state synchronizations.
 * 
 * @returns {CategoriesHookReturn} An object containing the categories array, loading flag, and error state.
 * 
 * @example
 * ```tsx
 * const { categories, isLoading, error } = useCategories();
 * 
 * if (isLoading) return <SkeletonLoader/>;
 * if (error) return <ErrorMessage text="Failed to load categories"/>;
 * 
 * return (
 *   <select>
 *     {categories.map((cat) => (
 *       <option key={cat.id} value={cat.code}>{cat.name}</option>
 *     ))}
 *   </select>
 * );
 * ```
 */
export const useCategories = (): CategoriesHookReturn => {
  // Fetch school categories using TanStack Query as the single source of truth (cache)
  const { data, error, isLoading } = useQuery<SchoolCategory[]>({
    queryKey: ["public-school-categories"],
    queryFn: () => apiFetch<SchoolCategory[]>("/public/school-categories"),
    
    // Performance & Caching Configuration
    staleTime: 1000 * 60 * 60, // 1 Hour - Categories rarely change
    gcTime: 1000 * 60 * 60 * 2,    // 2 Hours - Keep in memory cache
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  return {
    categories: data ?? [],
    isLoading,
    error,
  };
};