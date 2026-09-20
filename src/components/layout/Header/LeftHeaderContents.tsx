import { useIsMobileView } from "@/lib/store";
import { useSidebar } from "../SideBar";
import { HiMenuAlt1 } from "react-icons/hi";
import { useWorkspace } from "@/shared/providers";

export const LeftHeaderContents = () => {
  const { toggle } = useSidebar();
  const { pageTitle } = useWorkspace();
  const isMobile = useIsMobileView();

  return (
    <div className="flex items-center gap-3">
      {/* Mobile drawer toggle button */}
      {isMobile && (
        <button 
          onClick={toggle}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted border border-border/50 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Toggle navigation menu"
        >
          <HiMenuAlt1 size={22} />
        </button>
      )}

      {/* Dynamic page title */}
      <h3 className="font-bold text-base sm:text-lg text-foreground tracking-tight">
        {pageTitle}
      </h3>
    </div>
  );
};

export default LeftHeaderContents;
