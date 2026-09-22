import { cn } from "@/lib/utils";

type UserAvatarSize = "sm" | "md" | "lg";

interface UserAvatarProps {
  name?: string;
  size?: UserAvatarSize;
  className?: string;
}

const sizeClasses: Record<UserAvatarSize, string> = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-12 text-base",
};

function getInitial(name?: string) {
  if (!name?.trim()) return "U";

  return name.trim().charAt(0).toUpperCase();
}

/**
 * Premium user avatar with a subtle 3D gradient effect.
 */
export function UserAvatar({
  name,
  size = "md",
  className,
}: UserAvatarProps) {
  return (
    <div
      aria-label={name ? `${name}'s avatar` : "User avatar"}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center",
        "overflow-hidden rounded-full",
        "bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.32),transparent_32%),linear-gradient(145deg,#00166F,#0033FF_55%,#6B8CFF)]",
        "font-semibold text-white",
        "shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),inset_0_-2px_4px_rgba(0,0,0,0.18),0_4px_12px_rgba(0,51,255,0.18)]",
        "select-none",
        sizeClasses[size],
        className,
      )}
    >
      <span className="relative z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)]">
        {getInitial(name)}
      </span>
    </div>
  );
}