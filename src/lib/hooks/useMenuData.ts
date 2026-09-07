/**
 * @fileoverview Sidebar Menu Data Engine
 * @description Inavuta menu kulingana na context ya User (Identity) au School (Tenant).
 */

"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MenuGroup } from "@/types";
import { apiFetch } from "@/lib/api/api-fetch";

/**
 * ### useMenuData
 * Hook ya kuvuta menu groups za sidebar.
 * * @param {'user' | 'school'} context - Aina ya menu default ni user.
 * * @param {string} id - TenantID (kama context ni school) au UserID (kama context ni user).
 */
export const useMenuData = (context: 'user' | 'school' = 'user', id?: string) => {
  const queryClient = useQueryClient();
  
  // Endpoint kulingana na context
  const endpoint = context === 'user' 
    ? '/my/sidebar-items' 
    : '/school/sidebar-items';

  // KEY INAYOZUIA STALE DATA: Tunajumuisha context na ID husika
  // Hii inafanya cache iwe "unique" kwa kila shule au kila user.
  const queryKey = ['sidebar-menu', context, id];

  const { data, error, isLoading } = useQuery<MenuGroup[]>({
    queryKey,
    queryFn: () => apiFetch<MenuGroup[]>(endpoint),
    
    // Ulinzi wa performance
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10,   // 10 minutes cache lifespan
    
    // Hii ni muhimu: Query haita-trigger kama ID haipo (Ulinzi wa ziada)
    enabled: !!id,
  });

  /**
   * @function refreshSidebarMenu
   * @description Inalazimisha kuvuta menu mpya kwa scope ya id hiyo tu.
   */
  const refreshSidebarMenu = async () => {
    await queryClient.invalidateQueries({ queryKey });
  };

  return {
    menuGroups: data || [],
    isLoading,
    isError: error,
    refreshSidebarMenu,
  };
};