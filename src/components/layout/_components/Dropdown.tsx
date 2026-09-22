import { cn } from '@/lib/utils';
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

type DropdownChildren = ReactNode | ((close: () => void) => ReactNode);

interface DropdownProps {
  trigger: ReactNode;
  children: DropdownChildren;
  align?: 'left' | 'right';
  className?: string;
}

export function Dropdown({
  trigger,
  children,
  align = 'right',
  className = '',
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const menuWidth = 320;

    let left = rect.left;
    if (align === 'right') {
      left = rect.right - Math.min(menuWidth, rect.width);
    }

    setPosition({
      top: rect.bottom + 8,
      left: Math.max(8, Math.min(left, window.innerWidth - menuWidth - 8)),
    });
  }, [open, align]);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className="relative" ref={triggerRef}>
      <div onClick={() => setOpen((v) => !v)}>{trigger}</div>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            className={cn(
              'fixed z-50 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden',
              className,
            )}
            style={{
              top: position.top,
              left: position.left,
              width: 'max-content',
              maxWidth: 'min(20rem, calc(100vw - 1rem))',
            }}
          >
            {typeof children === 'function'
              ? (children as (close: () => void) => ReactNode)(close)
              : children}
          </div>,
          document.body,
        )}
    </div>
  );
}
