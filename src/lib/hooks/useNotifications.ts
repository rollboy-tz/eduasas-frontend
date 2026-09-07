/**
 * @fileoverview Notification Engine
 * @description Inasimamia upokeaji, usomaji, na ufutaji wa notification 
 * kwa kutumia TanStack Query (Optimistic UI updates).
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api }  from "@/lib/api";
import { apiFetch } from "@/lib/api/api-fetch";
import { useUser } from "./useUser";
import { NotificationResponse } from "@/types";

/**
 * ### NotificationsHookReturn
 * @property {NotificationItem[]} notifications - Orodha ya taarifa zote.
 * @property {number} unreadCount - Idadi ya taarifa ambazo hazijasomwa.
 * @property {boolean} isLoading - Hali ya uvutaji data.
 * @property {Function} markAsRead - Kuweka alama ya kusomwa.
 * @property {Function} clearNotifications - Kufuta taarifa.
 * @property {Function} refresh - Kulazimisha sync na server.
 */

/**
 * Hook ya kitalamu kwa ajili ya usimamizi wa Notifications.
 */
export function useNotifications() {
  const queryClient = useQueryClient();
  const { profile } = useUser();
  const NOTIFICATIONS_KEY = ['my-notifications', profile?.id];
  // 1. Fetching Data
  const { data, isLoading } = useQuery<NotificationResponse>({
    queryKey: NOTIFICATIONS_KEY,
    queryFn: () => apiFetch<NotificationResponse>('/my/notifications'),
    staleTime: 1000 * 60, // Data inabaki fresh kwa dakika 1
    refetchInterval: 1000 * 60, // Auto-refetch kila dakika
  });

  const notifications = data?.notifications || [];
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // 2. Mutations (CRUD)
  
  // Mark as Read Mutation
  const markAsReadMutation = useMutation({
    mutationFn: (ids: string[]) => api.patch('/my/notifications/read', { notificationIds: ids }),
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_KEY });
      const previousData = queryClient.getQueryData<NotificationResponse>(NOTIFICATIONS_KEY);
      
      queryClient.setQueryData(NOTIFICATIONS_KEY, (old: NotificationResponse | undefined) => {
        if (!old) return old;
        return {
          ...old,
          notifications: old.notifications.map(n => ids.includes(n.id) ? { ...n, isRead: true } : n)
        };
      });
      return { previousData };
    },
    onError: (_, __, context) => queryClient.setQueryData(NOTIFICATIONS_KEY, context?.previousData),
    onSettled: () => queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY }),
  });

  // Clear Notifications Mutation
  const clearMutation = useMutation({
    mutationFn: (ids: string[]) => api.delete('/my/notifications/clear', { data: { notificationIds: ids } }),
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_KEY });
      const previousData = queryClient.getQueryData<NotificationResponse>(NOTIFICATIONS_KEY);
      
      queryClient.setQueryData(NOTIFICATIONS_KEY, (old: NotificationResponse | undefined) => {
        if (!old) return old;
        return {
          ...old,
          notifications: old.notifications.filter(n => !ids.includes(n.id)),
          meta: { ...old.meta, count: old.meta.count - ids.length }
        };
      });
      return { previousData };
    },
    onError: (_, __, context) => queryClient.setQueryData(NOTIFICATIONS_KEY, context?.previousData),
    onSettled: () => queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY }),
  });

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead: (ids: string[]) => markAsReadMutation.mutate(ids),
    clearNotifications: (ids: string[]) => clearMutation.mutate(ids),
    refresh: () => queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY })
  };
}