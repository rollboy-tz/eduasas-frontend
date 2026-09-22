import { Users as UsersIcon } from 'lucide-react';
import { FaDiagramProject } from 'react-icons/fa6';
import DashboardLayout from '@/components/DashboardLayout';
import { type NavItem } from '@/components/ui/NavItem';

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', active: true },
  { id: 'analytics', label: 'Analytics', icon: 'BarChart3' },
  { id: 'projects', label: 'Projects', icon: FaDiagramProject },
  { id: 'team', label: 'Team', icon: UsersIcon },
  { id: 'messages', label: 'Messages', icon: 'FaComments' },
  { id: 'calendar', label: 'Calendar', icon: 'Calendar' },
  { id: 'settings', label: 'Settings', icon: 'Settings' },
];

function App() {
  return (
    <DashboardLayout
      workspaceName="Acme Workspace"
      userName="Alex Morgan"
      userInitial="A"
      brandName="Acme"
      navItems={navItems}
    >
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-400">
        Dashboard content goes here
      </div>
    </DashboardLayout>
  );
}

export default App;
