
import { X, LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils/helper"; // Kama unatumia shadcn/clsx, kama hutumia futa hii

interface EduServerButtonProps {
  label?: string;
  href?: string; // Kama unataka iende sehemu maalum badala ya router.back()
  icon?: LucideIcon;
  className?: string;
  variant?: "ghost" | "outline" | "neon";
}

export function EduServerButton({
  label,
  href,
  icon: Icon = X,
  className,
  variant = "ghost",
}: EduServerButtonProps) {
  const navigate = useNavigate();

  const handleAction = () => {
    if (href) {
      navigate(href);
    } else {
      navigate(-1); // Kurudi nyuma kwenye historia ya browser
    }
  };

  // Styles kulingana na muonekano wetu wa giza (Dark Mode)
  const variants = {
    ghost: "hover:bg-white/10 text-white/70 hover:text-white",
    outline: "border border-[var(--card-border)] hover:bg-white/5 text-white",
    neon: "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]",
  };

  return (
    <button
      onClick={handleAction}
      className={cn(
        "group flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 active:scale-95 cursor-pointer select-none",
        variants[variant],
        className
      )}
    >
      <Icon 
        size={20} 
        className="transition-transform duration-300 group-hover:scale-130" 
      />
      {label && (
        <span className="text-sm font-medium tracking-wide">
          {label}
        </span>
      )}
    </button>
  );
}