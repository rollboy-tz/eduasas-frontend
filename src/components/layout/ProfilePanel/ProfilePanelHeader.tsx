'use client'

import { useBadges } from "@/lib/hooks";
import { Bell, Mail, User } from "lucide-react";

type ActiveTab = "NOTIFICATIONS" | "INVITATIONS" | "PROFILE";

interface ProfilePanelHeaderProps {
    activeTab: ActiveTab;
    onChangeTab: (tab: ActiveTab) => void
}

export const ProfilePanelHeader = ( { activeTab, onChangeTab }: ProfilePanelHeaderProps ) => {
    const { notificationCount, invitationCount } = useBadges();

    const tabs: Array<{
        id: ActiveTab;
        icon: typeof User;
        count?: number;
    }> = [
        { id: "PROFILE", icon: User },
        { id: "NOTIFICATIONS", icon: Bell, count: notificationCount },
        { id: "INVITATIONS", icon: Mail, count: invitationCount },
    ];

    return (
        <div className="w-full">
            <div className="flex items-center gap-6 relative">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    const count = tab.count ?? 0;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => onChangeTab(tab.id)}
                            className={`relative p-2 rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-center ${
                                isActive 
                                    ? "text-indigo-800 after after:content-[''] after:absolute after:h-[3px] after:w-full after:bottom-0 after:bg-indigo-600 after:rounded-full" 
                                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                            }`}
                        >
                            <Icon size={18} />
                            
                            {/* Badge Counter */}
                            {count > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-xs">
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