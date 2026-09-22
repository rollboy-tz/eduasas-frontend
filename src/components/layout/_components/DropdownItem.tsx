import { cn } from '@/lib/utils';
import { type ReactNode } from 'react';

interface DropdownItemProps {
  icon?: ReactNode;
  children: ReactNode;
  onClick?: () => void;
  danger?: boolean;
  trailing?: ReactNode;
}

export function DropdownItem({
  icon,
  children,
  onClick,
  danger = false,
  trailing,
}: DropdownItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
        danger
          ? 'text-rose-600 hover:bg-rose-50'
          : 'text-gray-700 hover:bg-gray-50',
      )}
    >
      {icon && (
        <span className={danger ? 'text-rose-400' : 'text-gray-400'}>
          {icon}
        </span>
      )}
      <span className="flex-1 text-left">{children}</span>
      {trailing}
    </button>
  );
}

interface DropdownSectionProps {
  children: ReactNode;
  withDivider?: boolean;
}

export function DropdownSection({
  children,
  withDivider = true,
}: DropdownSectionProps) {
  return (
    <div
      className={cn('px-1.5 py-1.5', withDivider && 'border-t border-gray-100')}
    >
      {children}
    </div>
  );
}
