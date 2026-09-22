import { useState, type ReactNode } from 'react';
import DashboardHeader from '@/components/DashboardHeader';
import Sidebar, { type SidebarMode } from '@/components/Sidebar';
import { type NavItem } from '@/components/ui/NavItem';
import { cn } from '@/components/ui/cn';

interface DashboardLayoutProps {
  children: ReactNode;
  navItems?: NavItem[];
  workspaceName?: string;
  userName?: string;
  userInitial?: string;
  userEmail?: string;
  brandName?: string;
}

const defaultNavItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', active: true },
  { id: 'analytics', label: 'Analytics', icon: 'BarChart3' },
  { id: 'projects', label: 'Projects', icon: 'FolderKanban' },
  { id: 'team', label: 'Team', icon: 'Users' },
  { id: 'messages', label: 'Messages', icon: 'MessagesSquare' },
  { id: 'calendar', label: 'Calendar', icon: 'Calendar' },
  { id: 'settings', label: 'Settings', icon: 'Settings' },
];

export default function DashboardLayout({
  children,
  navItems = defaultNavItems,
  workspaceName,
  userName,
  userInitial,
  userEmail,
  brandName,
}: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mode, setMode] = useState<SidebarMode>('hover');

  const isPinned = mode === 'expanded';

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        navItems={navItems}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        mode={mode}
        onModeChange={setMode}
        brandName={brandName}
      />

      <div
        className={cn(
          'transition-all duration-300',
          isPinned ? 'lg:pl-60' : 'lg:pl-16',
        )}
      >
        <DashboardHeader
          workspaceName={workspaceName}
          userName={userName}
          userInitial={userInitial}
          userEmail={userEmail}
          onMenuToggle={() => setMobileOpen(true)}
        />

        <main className="px-4 sm:px-6 py-8">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
