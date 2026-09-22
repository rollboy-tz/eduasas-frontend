import { useState, type ReactNode } from 'react';
import Topbar from './Topbar';
import Sidebar, { type SidebarMode } from './Sidebar';
import { cn } from '@/lib/utils';
import { NavItem } from './_components';
import { Home, School2, Settings } from 'lucide-react';


const menuData: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home, active: true },
  { id: 'schools', label: 'Schools', icon: School2 },
  { id: 'settings', label: 'Settings', icon: Settings },
];


interface DashLayoutProps {
  children: ReactNode;
  navItems?: NavItem[];
  workspaceName?: string;
  userName?: string;
  userInitial?: string;
  userEmail?: string;
  brandName?: string;
}

export default function DashLayout({
  children,
  navItems = menuData ,
  workspaceName,
  userName,
  userInitial,
  userEmail,
  brandName,
}: DashLayoutProps) {
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
        <Topbar
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
