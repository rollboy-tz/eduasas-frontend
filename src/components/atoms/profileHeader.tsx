import { cn } from "@/lib/utils/helper";
import { Camera, UserIcon } from "lucide-react";

/**
 * Mipangilio ya ukubwa wa Avatar na Banner.
 */
const sizes = {
  sm: { banner: "h-20", avatar: "w-16 h-16", mt: "-mt-8", icon: 25 },
  md: { banner: "h-32", avatar: "w-20 h-20", mt: "-mt-10", icon: 35 },
  lg: { banner: "h-40", avatar: "w-28 h-28", mt: "-mt-14", icon: 50 },
  xl: { banner: "h-48", avatar: "w-36 h-36", mt: "-mt-18", icon: 65 },
};

interface ProfileHeaderProps {
  /** URL ya picha ya banner. Ikiwa haipo, bannerColor itatumika. */
  bannerImage?: string;
  /** URL ya picha ya avatar. Ikiwa haipo, UserIcon fallback itatumika. */
  avatarImage?: string;
  /** Rangi ya fallback kama bannerImage haipo. */
  bannerColor?: string;
  /** Nafasi ya avatar kwenye banner. */
  avatarPosition?: "left" | "center" | "right";
  /** Ukubwa wa component nzima (sm, md, lg, xl). */
  size?: keyof typeof sizes;
  /** Kama ni true, picha inaweza kubadilishwa (inakuwa na camera icon na hover effect) */
  isEditable?: boolean;
  /** Callback inayokimbia mtumiaji akibofya avatar */
  onAvatarClick?: () => void;
  /** Banner styles kwa ajili ya customization */
  bannerClasses?: string;
  className?: string;
}

/**
 * ### ProfileHeader
 * Component ya kisasa kwa ajili ya Profile Pages.
 * Inasaidia picha za nje (next/image), fallback icons, na ukubwa unaobadilika (responsive).
 * * @example
 * <ProfileHeader size="lg" avatarPosition="left" bannerColor="bg-slate-800" />
 */
export const ProfileHeader = ({
  bannerImage,
  avatarImage,
  bannerColor = "bg-primary/50",
  avatarPosition = "center",
  bannerClasses,
  size = "md",
  className,
  isEditable = false,
  onAvatarClick,
}: ProfileHeaderProps) => {
  const currentSize = sizes[size];
  
  const positionMap = {
    left: "justify-start ml-6",
    center: "justify-center",
    right: "justify-end mr-6",
  };

  return (
    <div className={cn("relative w-full flex flex-col bg-card", className)}>
      {/* BANNER SECTION */}
      <div className={cn("relative w-full rounded-b-xl overflow-hidden", bannerClasses, currentSize.banner, bannerColor)}>
        {bannerImage && (
          <img src={bannerImage} alt="Banner" className="object-cover" />
        )}
      </div>

      {/* AVATAR SECTION */}
      <div className={cn("relative flex w-full", currentSize.mt, positionMap[avatarPosition])}>
        <div 
          onClick={isEditable ? onAvatarClick : undefined}
          className={cn(
            "flex items-center justify-center rounded-full bg-primary border-4 border-card shadow-lg overflow-hidden relative",
            currentSize.avatar,
            isEditable && "cursor-pointer group"
          )}
        >
          {avatarImage ? (
            <img src={avatarImage} alt="Profile" width={144} height={144} className="w-full h-full object-cover" />
          ) : (
            <UserIcon size={currentSize.icon} className="text-white fill-white" />
          )}

          {/* Kamera Overlay (Inatokea ukiwa editable) */}
          {isEditable && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="text-white" size={currentSize.icon / 1.5} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};