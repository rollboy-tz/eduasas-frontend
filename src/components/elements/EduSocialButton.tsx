import { cn } from "@/lib/utils";

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
    md: showText ? "h-10 px-5 text-base md:text-sm rounded-lg" : "h-10 w-10 rounded-lg",
    lg: showText ? "h-11 px-6 text-base md:text-sm rounded-lg" : "h-11 w-11 rounded-lg",
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
        "relative flex items-center justify-center transition-all duration-200 cursor-pointer w-full",
        "font-semibold active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed",
        "bg-card border border-border text-foreground shadow-2xs",
        "hover:bg-muted hover:border-border",
        sizeClasses[size],
        className
      )}
    >
      {isLoading ? (
        <Spinner />
      ) : (
        <div className={cn(
          "flex items-center justify-center gap-2.5",
          iconPosition === "right" ? "flex-row-reverse" : "flex-row"
        )}>
          {iconPath && (
            <div className="relative shrink-0 flex items-center justify-center">
              <img
                src={iconPath}
                alt="Social Icon"
                width={iconSize}
                height={iconSize}
                className="object-contain"
              />
            </div>
          )}

          {showText && text && (
            <span className="tracking-tight">
              {text}
            </span>
          )}
        </div>
      )}
    </button>
  );
};

export default EduSocialButton;
