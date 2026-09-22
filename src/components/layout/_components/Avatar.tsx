import { cn } from "@/lib/utils";

interface AvatarProps {
  initial: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
};

export function Avatar({
  initial,
  size = 'md',
  className = '',
}: AvatarProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white font-semibold shrink-0 shadow-sm ring-2 ring-white/20',
        sizeClasses[size],
        className,
      )}
    >
      {initial.toUpperCase()}
    </div>
  );
}
