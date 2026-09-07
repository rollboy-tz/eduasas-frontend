/**
 * @file use-badges.ts
 * @description Hook rahisi na ya wazi ya kusimamia hesabu za notification na jumla ya alert zote.
 * Inasoma data kutoka kwenye SWR Cache pekee (Zero Network Overhead).
 * @author Rollboy TZ (EduAsas Tech)
 */

'use client'

import { useNotifications, useUserStaffInvitations } from "@/lib/hooks";

/**
 * useBadges
 * Hook inayorudisha idadi sahihi ya notification na mialiko inayohitaji umakini.
 */
export function useBadges() {
  // Kuvuta data kutoka kwenye SWR Cache
  const { unreadCount = 0 } = useNotifications();
  const { invitations = [] } = useUserStaffInvitations();

  // Kukokotoa mialiko mipya/inayosubiri (Pending & Not Archived)
  const pendingInvitationsCount = invitations.filter(
    (inv) => inv.status === "PENDING" && !inv.archived
  ).length;

  return { 
    // Hesabu maalum za notifications pekee
    notificationCount: unreadCount,
    
    // Hesabu maalum za mialiko (invitations) pekee
    invitationCount: pendingInvitationsCount,
    
    // Jumla kuu ya taarifa zote zinazohitaji kuonekana
    totalAlerts: unreadCount + pendingInvitationsCount,
    
    // Hali ya kuangalia kama kuna kitu chochote kipya kinachosubiri
    hasAnyPending: (unreadCount + pendingInvitationsCount) > 0
  };
}