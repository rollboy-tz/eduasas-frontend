'use client';

import { useBadges } from "@/lib/hooks";
import { Bell, Mail, User } from "lucide-react";

type ActiveTab = "NOTIFICATIONS" | "INVITATIONS" | "PROFILE";

interface ProfilePanelHeaderProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
}

export const ProfilePanelHeader = ({ activeTab, onChangeTab }: ProfilePanelHeaderProps) => {
  const { notificationCount, invitationCount } = useBadges();

  const tabs: Array<{
    id: ActiveTab;
    icon: typeof User;
    count?: number;
    label: string;
  }> = [
    { id: "PROFILE", icon: User, label: "Profile" },
    { id: "NOTIFICATIONS", icon: Bell, count: notificationCount, label: "Notifications" },
    { id: "INVITATIONS", icon: Mail, count: invitationCount, label: "Invitations" },
  ];

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 sm:gap-6 relative">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const count = tab.count ?? 0;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              aria-label={tab.label}
              className={`relative p-2 rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-center ${
                isActive 
                  ? "text-primary font-semibold after:content-[''] after:absolute after:h-[2px] after:w-full after:bottom-0 after:bg-primary after:rounded-full" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Icon size={18} />
              
              {/* Badge Counter */}
              {count > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground shadow-2xs">
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
