import { cn } from "@/lib/utils";

// --- EDU SOCIAL BUTTON (Imeondolewa 'use client' kwa ajili ya Vite) ---
interface SocialButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  text?: string;
  iconPath?: string;
  iconPosition?: "left" | "right";
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

export const EduSocialButton = ({
  isLoading = false,
  text,
  iconPath = "/icons/google.png",
  iconPosition = "left",
  showText = true,
  size = "lg",
  className,
  disabled,
  ...props
}: SocialButtonProps) => {

  const sizeClasses = {
    sm: showText ? "h-9 px-4 text-sm rounded-md" : "h-9 w-9 rounded-md",
    md: showText ? "h-10 px-5 text-base md:text-sm rounded-lg" : "h-11 w-11 rounded-lg",
    lg: showText ? "h-11 px-6 text-base rounded-xl" : "h-13 w-13 rounded-xl",
  };

  const iconSize = {
    sm: 16,
    md: 18,
    lg: 20
  }[size];

  const Spinner = () => (
    <svg className="animate-spin h-5 w-5 opacity-70" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  return (
    <button
      disabled={disabled || isLoading}
      {...props}
      className={cn(
        "relative flex items-center justify-center transition-all duration-300 cursor-pointer w-full",
        "font-bold active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
        "bg-white border border-slate-200 text-slate-700 shadow-sm",
        "hover:bg-slate-50 hover:border-slate-300",
        sizeClasses[size],
        className
      )}
    >
      {isLoading ? (
        <Spinner />
      ) : (
        <div className={cn(
          "flex items-center justify-center gap-3",
          iconPosition === "right" ? "flex-row-reverse" : "flex-row"
        )}>
          {iconPath && (
            <div className="relative flex-shrink-0 flex items-center justify-center">
              <img
                src={iconPath}
                alt="google-logo"
                width={iconSize}
                height={iconSize}
                className="object-contain"
              />
            </div>
          )}

          {showText && text && (
            <span className="tracking-tight font-medium">
              {text}
            </span>
          )}
        </div>
      )}
    </button>
  );
};