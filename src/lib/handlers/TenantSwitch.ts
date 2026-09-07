import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTenant } from '@/shared/providers';
import { apiMutation, apiFetch } from '@/lib/api';

// Definition ya Response Type kutoka Server
interface SwitchTenantResponseData {
  schoolId: string;
  schoolUId?: string;
  redirectToken?: string;
  name: string;
}

/**
 * ### useSwitchTenant Hook
 * Inasimamia mzunguko mzima wa maisha ya Workspace (Switching & Closing).
 */
export const useSwitchTenant = () => {
  const [isSwitching, setIsSwitching] = useState(false);
  const { setTenant, clearTenant } = useTenant();
  const queryClient = useQueryClient();

  /**
   * @function switchTenant
   * Inabadilisha shule, inasawazisha cache, na kurudisha response (pamoja na token).
   */
  const switchTenant = useCallback(
    async (schoolUId: string, schoolId: string): Promise<SwitchTenantResponseData | null> => {
      if (isSwitching) return null;

      setIsSwitching(true);
      try {
        const result = await apiMutation<SwitchTenantResponseData>("post", "/school/switch", {
          schoolUId,
          schoolId,
        });

        // Hakikisha request imefanikiwa kabla ya kubadilisha state na ku-clear cache
        if (result?.status === "success") {
          // Safisha cache zote za shule kabla ya kuhamia mpya
          await queryClient.removeQueries({ queryKey: ['school-context'] });

          setTenant(schoolUId);

          await queryClient.invalidateQueries({ queryKey: ['school-context'] });

          // Rudisha result nzima au token kwa ajili ya anaye-consume (k.mf. redirection au consume-page)
          return result.data;
        }

        return result.data;
      } catch (error) {
        console.error("Switching error:", error);
        throw error;
      } finally {
        setIsSwitching(false);
      }
    },
    [setTenant, queryClient]
  );

  /**
   * @function closeTenant
   * Inafunga shule, inasafisha cache, na inarudisha user kwenye hali ya kutokuwa na shule.
   */
  const closeTenant = useCallback(async () => {
    if (isSwitching) return;

    setIsSwitching(true);
    try {
      // 1. Tuma request ya kusitisha session kule server
      await apiFetch("/school/clear-context");

      // 2. Safisha kila kitu
      await queryClient.removeQueries({ queryKey: ['school-context'] });

      // 3. Weka state kuwa null kwenye provider na localStorage
      clearTenant();
    } catch (error) {
      console.error("Closing error:", error);
      throw error;
    } finally {
      setIsSwitching(false);
    }
  }, [clearTenant, queryClient]);

  return { switchTenant, closeTenant, isSwitching };
};