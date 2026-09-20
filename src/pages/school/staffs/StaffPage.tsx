/**
 * @file StaffPage.tsx
 * @description Enterprise-grade Staff Management page utilizing adaptive navigation tabs,
 * clean responsive toolbars, and high-performance layout for Vite + React.
 */


import { useSearchParams } from "react-router-dom";
import {
  Users,
  BookOpen,
  ShieldCheck,
  Building2,
} from "lucide-react";
import { AdaptiveTabs, TabItem } from "@/components/elements/AdaptiveTabs";
import { ExportStaffButton, StaffAllocationView, StaffDirectoryView } from "./_components";


// Ndani ya StaffPage component yako:


export default function StaffPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "directory";

  const handleTabChange = (tabName: string) => {
    setSearchParams({ tab: tabName });
  };

  // Orodha ya Tabs zetu za Staff Module
  const staffTabs: TabItem[] = [
    { id: "directory", label: "Staff Directory", icon: <Users className="w-4 h-4" /> },
    { id: "allocations", label: "Allocations", icon: <BookOpen className="w-4 h-4" /> },
    { id: "roles", label: "Roles & Permissions", icon: <ShieldCheck className="w-4 h-4" /> },
  ];

  return (
    <div className="">

      {/* Top Tabs & Action Button */}
      <div className="flex flex-col sm:flex-row items-cernter justify-between gap-4 mb-6">
        <div>
          {/* Adaptive Navigation Tabs (Pills on Desktop, Dropdown on Mobile) */}
          <div className="w-full min-w-0 mb-6">
            <AdaptiveTabs
              tabs={staffTabs}
              isMobile={false}
              activeTab={currentTab}
              onChange={handleTabChange}
              tabsWrapperClassName="border border-slate-200"
            />
          </div>
        </div>

        <ExportStaffButton />
      </div>

      {/* Header & Main Content Container area */}
      <div className="overflow-hidden">

        {currentTab === "directory" && (
          <StaffDirectoryView />
        )}

        {currentTab === "allocations"&& (
          <StaffAllocationView />
        )}

        {(currentTab !== "directory" &&  currentTab !== "allocations" ) &&(
          <div className="py-16 px-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3 border border-indigo-100">
              {currentTab === "roles" && <ShieldCheck className="w-6 h-6" />}
              {currentTab === "departments" && <Building2 className="w-6 h-6" />}
            </div>
            <h3 className="text-sm font-bold text-slate-900 capitalize">
              {currentTab.replace("-", " ")} Workspace
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Configured for managing {currentTab}. Integrated modules will populate here seamlessly.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}