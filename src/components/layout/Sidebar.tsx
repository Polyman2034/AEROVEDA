import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Map,
  Flame,
  TrendingUp,
  Camera,
  ShieldAlert,
  Network,
  Cpu,
  Settings,
  LogOut,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  badge?: string;
  count?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const { user, logout } = useAuth();

  const navigationGroups: NavGroup[] = [
    {
      label: 'Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      ],
    },
    {
      label: 'Maps & Forecasts',
      items: [
        { id: 'intelligence-map', label: 'Pollution Map', icon: Map },
        { id: 'hotspot-intelligence', label: 'Hotspots', icon: Flame, badge: 'Live' },
        { id: 'forecast', label: 'Forecast', icon: TrendingUp },
      ],
    },
    {
      label: 'Community & Action',
      items: [
        { id: 'citizen-reports', label: 'Citizen Reports', icon: Camera },
        { id: 'action-center', label: 'Action Center', icon: ShieldAlert, count: '03' },
        { id: 'federated-network', label: 'Shared AI Network', icon: Network },
      ],
    },
    {
      label: 'System',
      items: [
        { id: 'system-architecture', label: 'System Overview', icon: Cpu },
        { id: 'settings', label: 'Settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-60 shrink-0 flex flex-col bg-white border-r border-zinc-200/80 h-screen sticky top-0 select-none">
      {/* Brand Header */}
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-zinc-900 flex items-center justify-center text-white font-semibold text-xs tracking-tight shadow-2xs">
            AV
          </div>
          <div>
            <div className="font-semibold tracking-tight text-zinc-900 text-sm leading-none">
              AEROVEDA
            </div>
            <div className="text-[11px] text-zinc-400 font-normal mt-1 leading-none">
              Environmental Monitoring
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
        {navigationGroups.map((group) => (
          <div key={group.label} className="space-y-1">
            <div className="px-2 text-[10px] font-medium tracking-wider uppercase text-zinc-400">
              {group.label}
            </div>
            <div className="space-y-0.5 pt-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs transition-colors text-left ${
                      isActive
                        ? 'bg-zinc-100 text-zinc-900 font-medium'
                        : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 font-normal'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-zinc-900' : 'text-zinc-400'
                      }`}
                      strokeWidth={isActive ? 2 : 1.75}
                    />
                    <span className="truncate flex-1">{item.label}</span>

                    {item.badge && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    )}

                    {item.count && (
                      <span className="text-[10px] font-mono text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded">
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Session Footer */}
      <div className="p-3 border-t border-zinc-100">
        <div className="flex items-center justify-between gap-2 p-1.5 rounded-md hover:bg-zinc-50 transition-colors">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-6 h-6 rounded-full bg-zinc-100 text-zinc-700 flex items-center justify-center text-[11px] font-medium shrink-0 border border-zinc-200/60">
              {user?.name ? user.name.charAt(0) : 'O'}
            </div>
            <div className="min-w-0 truncate">
              <div className="text-xs font-medium text-zinc-900 truncate">
                {user?.name || 'Officer'}
              </div>
              <div className="text-[10px] text-zinc-400 truncate">
                {user?.jurisdiction?.split('&')[0] || 'Air Quality Officer'}
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            title="Sign Out"
            className="p-1 text-zinc-400 hover:text-zinc-700 rounded transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
