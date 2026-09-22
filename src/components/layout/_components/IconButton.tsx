import { cn } from '@/lib/utils';
import { type ReactNode } from 'react';

interface IconButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
  title?: string;
}

export function IconButton({
  children,
  onClick,
  className = '',
  ariaLabel,
  title,
}: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      title={title}
      className={cn(
        'p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors',
        className,
      )}
    >
      {children}
    </button>
  );
}
