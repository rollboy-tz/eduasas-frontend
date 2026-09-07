// src/types/notifications.ts

export type NotificationType = "SYSTEM" | "SCHOOL" | "ACADEMIC" | "PAYMENT";
export type NotificationPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  isRead: boolean;
  createdAt: string;
  title: string;
  content: string;
  link: string | null;
}

export interface NotificationResponse {
  meta: {
    page: number;
    limit: number;
    count: number;
  };
  notifications: NotificationItem[];
}