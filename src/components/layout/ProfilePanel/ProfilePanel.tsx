import { useState } from "react";
import { useProfilePanel } from "@/components/layout/ProfilePanel";
import { X } from "lucide-react";
import { NotificationsCotainer } from "./Notifications";
import { InvitessContainer } from "./Invitations";
import { MinProfileContainer } from "./Profile/ProfileContainer";
import { ProfilePanelHeader } from "./ProfilePanelHeader";

type ActiveTab = "NOTIFICATIONS" | "INVITATIONS" | "PROFILE";

export default function ProfilePanel() {
  const { isOpen, closeProfilePanel } = useProfilePanel();
  const [activeTab, setActiveTab] = useState<ActiveTab>("PROFILE");

  if (!isOpen) return null;

  const RenderContents = () => {
    switch (activeTab) {
      case "NOTIFICATIONS":
        return <NotificationsCotainer />;
      case "INVITATIONS":
        return <InvitessContainer />;
      case "PROFILE":
        return <MinProfileContainer />;
      default:
        return <MinProfileContainer />;
    }
  };

  return (
    <>
      {/* 1. BACKDROP OVERLAY */}
      <div
        onClick={closeProfilePanel}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
      />

      {/* 2. RIGHT CONTAINER PANEL */}
      <aside className="fixed top-0 right-0 z-50 h-screen w-80 max-w-[90vw] bg-card text-card-foreground border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">

        {/* PANEL CLOSE HEADER */}
        <div className="flex items-center justify-between p-2 border-b border-border">
          <ProfilePanelHeader activeTab={activeTab} onChangeTab={(tab) => setActiveTab(tab)} />
          <button
            onClick={closeProfilePanel}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all cursor-pointer"
            aria-label="Close profile panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PANEL CONTENT BODY */}
        <div className="flex-1 overflow-y-auto">
          <RenderContents />
        </div>

      </aside>
    </>
  );
}
