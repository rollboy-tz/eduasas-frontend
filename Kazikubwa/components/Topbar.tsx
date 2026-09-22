import { useState } from 'react';
import { Menu, Search, X, Bell, User, Settings, LogOut, Mail } from 'lucide-react';
import Dropdown from '@/components/ui/Dropdown';
import DropdownItem, { DropdownSection } from '@/components/ui/DropdownItem';
import IconButton from '@/components/ui/IconButton';
import Avatar from '@/components/ui/Avatar';
import { cn } from '@/components/ui/cn';

interface Notification {
  id: number;
  title: string;
  description: string;
  time: string;
  unread: boolean;
}

const sampleNotifications: Notification[] = [
  {
    id: 1,
    title: 'New comment',
    description: 'Sarah left a comment on "Q4 Roadmap"',
    time: '2m ago',
    unread: true,
  },
  {
    id: 2,
    title: 'Task completed',
    description: 'James marked "API refactor" as done',
    time: '1h ago',
    unread: true,
  },
  {
    id: 3,
    title: 'New member',
    description: 'Emily Chen joined the workspace',
    time: '3h ago',
    unread: true,
  },
  {
    id: 4,
    title: 'Deployment',
    description: 'Production deploy succeeded for v2.4.1',
    time: '5h ago',
    unread: false,
  },
];

interface TopbarProps {
  workspaceName?: string;
  userName?: string;
  userInitial?: string;
  userEmail?: string;
  onMenuToggle?: () => void;
}

export default function Topbar({
  workspaceName = 'Acme Workspace',
  userName = 'Alex Morgan',
  userInitial = 'A',
  userEmail = 'alex@acme.com',
  onMenuToggle,
}: TopbarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState(sampleNotifications);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200/70">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 -ml-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 text-white text-sm font-semibold shrink-0">
              {workspaceName.charAt(0).toUpperCase()}
            </div>
            <h1 className="text-sm font-semibold text-gray-900 truncate">
              {workspaceName}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Search */}
          <div className="relative">
            {searchOpen ? (
              <div className="flex items-center absolute right-0 top-1/2 -translate-y-1/2 bg-white rounded-lg border border-gray-200 shadow-md z-50">
                <Search className="w-4 h-4 text-gray-400 ml-3" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search..."
                  className="w-40 sm:w-56 px-2.5 py-1.5 text-sm bg-transparent outline-none rounded-lg"
                />
                <button
                  onClick={() => setSearchOpen(false)}
                  className="p-1.5 mr-1 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close search"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <IconButton
                onClick={() => setSearchOpen(true)}
                ariaLabel="Search"
                title="Search"
              >
                <Search className="w-5 h-5" />
              </IconButton>
            )}
          </div>

          {/* Notifications */}
          <Dropdown
            trigger={
              <div className="relative">
                <IconButton ariaLabel="Notifications" title="Notifications">
                  <Bell className="w-5 h-5" />
                </IconButton>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[15px] h-[15px] px-1 flex items-center justify-center text-[9px] font-bold text-white bg-blue-600 rounded-full ring-2 ring-white" />
                )}
              </div>
            }
            className="w-80 max-w-[calc(100vw-2rem)]"
          >
            {(close: () => void) => (
              <>
                <div className="flex items-center justify-between px-4 py-3">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="px-2 space-y-1 max-h-72 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={cn(
                        'group flex gap-3 px-3 py-2.5 rounded-xl transition-colors cursor-pointer',
                        n.unread
                          ? 'bg-blue-50/60 hover:bg-blue-50'
                          : 'hover:bg-gray-50',
                      )}
                    >
                      <div className="shrink-0 mt-1">
                        <div
                          className={cn(
                            'w-2 h-2 rounded-full',
                            n.unread ? 'bg-blue-600' : 'bg-transparent',
                          )}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 leading-snug">
                          {n.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                          {n.description}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-1">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100">
                  <button
                    onClick={close}
                    className="w-full py-2.5 text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    View all notifications
                  </button>
                </div>
              </>
            )}
          </Dropdown>

          {/* Avatar menu */}
          <Dropdown
            trigger={
              <button
                className="p-0.5 rounded-full hover:ring-2 hover:ring-blue-200 transition-all"
                aria-label="Profile menu"
              >
                <Avatar initial={userInitial} size="sm" />
              </button>
            }
            className="w-60"
          >
            {() => (
              <>
                <div className="px-4 py-3 flex items-center gap-3">
                  <Avatar initial={userInitial} size="md" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {userName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                  </div>
                </div>

                <DropdownSection withDivider={false}>
                  <DropdownItem icon={<User className="w-4 h-4" />}>
                    Profile
                  </DropdownItem>
                  <DropdownItem
                    icon={<Mail className="w-4 h-4" />}
                    trailing={
                      <span className="ml-auto text-xs font-medium text-white bg-blue-600 px-1.5 py-0.5 rounded-full">
                        3
                      </span>
                    }
                  >
                    Inbox
                  </DropdownItem>
                  <DropdownItem icon={<Settings className="w-4 h-4" />}>
                    Settings
                  </DropdownItem>
                </DropdownSection>

                <DropdownSection>
                  <DropdownItem icon={<LogOut className="w-4 h-4" />} danger>
                    Sign Out
                  </DropdownItem>
                </DropdownSection>
              </>
            )}
          </Dropdown>
        </div>
      </div>
    </header>
  );
}
