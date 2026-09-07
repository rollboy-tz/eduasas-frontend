// path: src/components/layout/HeaverV2/LeftHeaderContents.tsx

'use client';

import { useIsMobileView } from "@/lib/store"; // Au hook yako ya mobile view
import { useSidebar } from "../SideBar";
import { Sidebar } from "lucide-react";
import { useWorkspace } from "@/shared/providers";

export const LeftHeaderContents = () => {

  const { toggle } = useSidebar()

  const { pageTitle } = useWorkspace();
  const isMobile = useIsMobileView();

  return (
    <div className="flex items-center gap-3">
      {/* Kitufe cha Menu kinaonekana kwenye skrini ndogo (mobile) pekee */}
      {isMobile && (
        <button 
          onClick={toggle}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Fungua Menu"
        >
          <Sidebar size={18} />
        </button>
      )}

      {/* Dynamic Page Title kinachobadilika kulingana na ukurasa uliofunguka */}
      <h3 className="font-bold text-sm text-slate-800 tracking-tight">
        {pageTitle}
      </h3>
    </div>
  );
};