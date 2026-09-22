import { useState, useRef, useCallback } from 'react';
import {
  X,
  Layers,
  Pin,
  PinOff,
} from 'lucide-react';
import { IconComponent, NavItem } from './_components';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export type SidebarMode = 'expanded' | 'hover';

interface SidebarProps {
  navItems: NavItem[];
  mobileOpen: boolean;
  onCloseMobile: () => void;
  mode: SidebarMode;
  onModeChange: (mode: SidebarMode) => void;
  brandName?: string;
}

const HOVER_DELAY = 200;

function NavButton({
  item,
  expanded,
  onClick,
}: {
  item: NavItem;
  expanded: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={!expanded ? item.label : undefined}
      className={cn(
        'group relative w-full flex items-center rounded-lg transition-colors duration-150 overflow-hidden cursor-pointer',
        expanded ? 'gap-3 px-3 py-2.5' : 'justify-center py-2.5',
        item.active
          ? 'text-blue-600 bg-blue-50/20'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900',
      )}
    >
      <span
        className={cn(
          'absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full bg-blue-600 transition-all duration-200',
          item.active ? 'h-7 opacity-100' : 'h-0 opacity-0',
        )}
      />
      {RenderIcon(
        item.icon,
        cn(
          'w-[18px] h-[18px] shrink-0 transition-colors',
          item.active
            ? 'text-blue-600'
            : 'text-gray-400 group-hover:text-gray-600',
        ),
      )}
      <div
        className={cn(
          'overflow-hidden transition-all duration-300',
          expanded ? 'w-auto opacity-100' : 'w-0 opacity-0',
        )}
      >
        <span className="text-sm font-medium whitespace-nowrap">
          {item.label}
        </span>
      </div>
    </button>
  );
}

export default function Sidebar({
  navItems,
  mobileOpen,
  onCloseMobile,
  mode,
  onModeChange,
  brandName = 'EduAsas',
}: SidebarProps) {
  const [hovered, setHovered] = useState(false);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();

  const isExpanded = mode === 'expanded' || (mode === 'hover' && hovered);

  const handleMouseEnter = useCallback(() => {
    if (mode !== 'hover') return;
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setHovered(true), HOVER_DELAY);
  }, [mode]);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setHovered(false);
  }, []);

  const cycleMode = () => {
    const order: SidebarMode[] = ['hover', 'expanded'];
    const idx = order.indexOf(mode);
    onModeChange(order[(idx + 1) % order.length]);
  };

  const ModeIcon =
    mode === 'expanded' ? PinOff : Pin;

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-2 left-2 z-50 w-72 bg-white rounded-2xl border border-gray-100 shadow-xl flex flex-col transition-transform duration-300 lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-[calc(100%+1rem)]',
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white">
              <Layers className="w-5 h-5" />
            </div>
            <span className="font-semibold text-gray-900">{brandName}</span>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <NavButton
              key={item.id}
              item={item}
              expanded
              onClick={() => {
                onCloseMobile
                navigate(item.id)
              }
              } />
          ))}
        </nav>
      </aside>

      <aside
        className={cn(
          'hidden lg:flex fixed top-0 left-0 bottom-0 z-50 flex-col bg-white border-r border-gray-200 transition-all duration-300 overflow-x-hidden',
          isExpanded ? 'w-60' : 'w-16',
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="h-16 px-4 flex items-center border-b border-gray-100 shrink-0 justify-between">
          <div
            className={cn(
              'flex items-center',
              isExpanded ? 'gap-2.5' : 'justify-center',
            )}
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div
              className={cn(
                'overflow-hidden transition-all duration-300',
                isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0',
              )}
            >
              <span className="font-semibold text-gray-900 whitespace-nowrap">
                {brandName}
              </span>
            </div>
          </div>

          {isExpanded && (
            <button onClick={cycleMode} className="rounded-lg hover:bg-gray-100/80 p-2 text-gray-500 transition-all cursor-pointer">
              <ModeIcon className="w-5 h-5 shrink-0 rotate-45" />
            </button>
          )}
        </div>

        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavButton key={item.id} item={item} expanded={isExpanded} />
          ))}
        </nav>

        <div className="p-2 border-t border-gray-100 shrink-0">

        </div>
      </aside>
    </>
  );
}


export const RenderIcon = (icon: IconComponent, className: string) => {
  const Icon = icon;
  return <Icon className={className} />
}