import { EduMainLoader } from "@/components/atoms";

interface ScreenLoderProps {
  loadingText?: string;
  showBrandName?: boolean;
}

export function EduScreenLoader({ 
  loadingText = "Please wait", 
  showBrandName = true 
}: ScreenLoderProps) {
  return (
    <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-background overflow-hidden">
      
      <div className="relative flex flex-col items-center gap-4">
        {/* Animated Wrapper */}
        <div
          className="flex items-center justify-center"
        >
          {/* WEKA RANGI SAHIHI HAPA (HEX au CSS Variable) */}
          <EduMainLoader 
            size={36} 
            color="#0066FF" // Au "var(--primary, #0066FF)"
            loadingText={loadingText}
          />
        </div>
      </div>

      {/* Footer Branding */}
      {showBrandName && (
        <div className="absolute bottom-8 left-0 w-full text-center space-y-0.5">
          <p className="text-[11px] font-medium text-slate-500">
            EduAsas &copy; 2026
          </p>
          <p className="text-[10px] text-slate-400">
            Powered by Rollboy Services
          </p>
        </div>
      )}
    </div>
  );
}