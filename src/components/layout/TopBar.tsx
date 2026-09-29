import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { resetDatabase } from '../../services/api';

interface TopBarProps {
  activeTab: string;
}

const tabInfo: Record<string, { title: string; description: string }> = {
  dashboard: {
    title: 'Dashboard',
    description: 'Current air quality overview and active alerts',
  },
  'intelligence-map': {
    title: 'Pollution Map',
    description: 'Map view of pollution hotspots, sensors, and reports',
  },
  'hotspot-intelligence': {
    title: 'Hotspots',
    description: 'Detailed look at high-risk pollution areas and causes',
  },
  forecast: {
    title: 'Air Quality Forecast',
    description: 'Expected changes in air quality over the next hours',
  },
  'citizen-reports': {
    title: 'Citizen Reports',
    description: 'Community photos and reports with AI check',
  },
  'action-center': {
    title: 'Action Center',
    description: 'Current alerts and field responses',
  },
  'federated-network': {
    title: 'Shared AI Network',
    description: 'How cities improve AI models together without sharing private data',
  },
  'system-architecture': {
    title: 'System Overview',
    description: 'How data moves from sensors to alerts',
  },
  settings: {
    title: 'Settings',
    description: 'Profile and alert settings',
  },
};

export const TopBar: React.FC<TopBarProps> = ({ activeTab }) => {
  const { user } = useAuth();
  const current = tabInfo[activeTab] || { title: 'Dashboard', description: '' };
  const [isResetting, setIsResetting] = React.useState(false);

  const handleReset = async () => {
    if (confirm('Reset demo data to default?')) {
      setIsResetting(true);
      try {
        await resetDatabase();
        window.location.reload();
      } finally {
        setIsResetting(false);
      }
    }
  };

  return (
    <header className="h-14 px-8 bg-white border-b border-zinc-200/80 flex items-center justify-between gap-4 sticky top-0 z-20">
      {/* Left: Page Title + Context Description */}
      <div className="flex items-baseline gap-3 min-w-0">
        <h1 className="text-sm font-semibold text-zinc-900 tracking-tight shrink-0">
          {current.title}
        </h1>
        {current.description && (
          <span className="text-xs text-zinc-400 hidden md:inline truncate font-normal">
            — {current.description}
          </span>
        )}
      </div>

      {/* Right: Refined Status & Profile */}
      <div className="flex items-center gap-3">
        {/* Subtle Demo Status Indicator */}
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-100 text-[11px] text-zinc-600 font-medium border border-zinc-200/60">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span>Demo Mode</span>
        </div>

        {/* Quiet Reset Seed Action */}
        <button
          onClick={handleReset}
          disabled={isResetting}
          title="Reset Demo Data"
          className="text-[11px] text-zinc-400 hover:text-zinc-700 px-2 py-1 rounded transition-colors hidden sm:inline"
        >
          {isResetting ? 'Resetting...' : 'Reset Data'}
        </button>

        {/* User Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-zinc-200/70 text-xs">
          <div className="w-6 h-6 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[10px] font-medium">
            {user?.name ? user.name.charAt(0) : 'O'}
          </div>
          <span className="text-zinc-700 font-medium hidden sm:inline">
            {user?.name || 'Officer'}
          </span>
        </div>
      </div>
    </header>
  );
};
