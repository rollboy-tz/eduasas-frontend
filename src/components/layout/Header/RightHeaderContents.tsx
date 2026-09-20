import { useIsMobileView } from "@/lib/store";
import { useProfilePanel } from "../ProfilePanel";
import { CommandIcon, Search } from "lucide-react";
import { FaUser } from "react-icons/fa";
import { ThemeToggle } from "@/components/elements/ThemeToggle";

export const RightHeaderContents = () => {
  const isMobile = useIsMobileView();
  const { toggleProfilePanel } = useProfilePanel();

  const handleOpenSearch = () => {
    window.dispatchEvent(new CustomEvent("app:open-search"));
  };

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {/* Quick Search Trigger */}
      <button 
        type="button"
        onClick={handleOpenSearch}
        aria-label="Open search"
        className="flex items-center h-9 gap-2 px-2.5 rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors shadow-2xs cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <Search size={16} className="text-muted-foreground" />
        {!isMobile && (
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground font-normal">Search...</span>
            <div className="flex items-center px-1.5 py-0.5 gap-1 bg-muted rounded border border-border/60 text-muted-foreground font-mono text-[10px]">
              <CommandIcon size={11} /> <span>K</span>
            </div>
          </div>
        )}
      </button>

      {/* Theme Toggle Button */}
      <ThemeToggle compact />

      {/* User profile toggle */}
      <button 
        type="button"
        className="min-h-[40px] min-w-[40px] flex items-center justify-center bg-card border border-border rounded-full hover:bg-muted transition-colors shadow-2xs cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        onClick={toggleProfilePanel}
        aria-label="Open profile settings"
      >
        <div className="rounded-full text-muted-foreground flex items-center justify-center h-8 w-8">
          <FaUser size={16} />
        </div>
      </button>
    </div>
  );
};

export default RightHeaderContents;
