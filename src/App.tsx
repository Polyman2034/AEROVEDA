import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { DemoBanner } from './components/common/DemoBanner';

import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DashboardPage } from './pages/DashboardPage';
import { IntelligenceMapPage } from './pages/IntelligenceMapPage';
import { HotspotIntelligencePage } from './pages/HotspotIntelligencePage';
import { ForecastPage } from './pages/ForecastPage';
import { CitizenReportsPage } from './pages/CitizenReportsPage';
import { ActionCenterPage } from './pages/ActionCenterPage';
import { FederatedNetworkPage } from './pages/FederatedNetworkPage';
import { SystemArchitecturePage } from './pages/SystemArchitecturePage';
import { SettingsProfilePage } from './pages/SettingsProfilePage';
import { Menu, X } from 'lucide-react';

const AppContent: React.FC = () => {
  const { isAuthenticated, activeTab, setActiveTab } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!isAuthenticated) {
    if (authView === 'signup') {
      return <SignupPage onSwitchToLogin={() => setAuthView('login')} />;
    }
    return <LoginPage onSwitchToSignup={() => setAuthView('signup')} />;
  }

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'intelligence-map':
        return <IntelligenceMapPage />;
      case 'hotspot-intelligence':
        return <HotspotIntelligencePage />;
      case 'forecast':
        return <ForecastPage />;
      case 'citizen-reports':
        return <CitizenReportsPage />;
      case 'action-center':
        return <ActionCenterPage />;
      case 'federated-network':
        return <FederatedNetworkPage />;
      case 'system-architecture':
        return <SystemArchitecturePage />;
      case 'settings':
        return <SettingsProfilePage />;
      default:
        return <DashboardPage />;
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen w-full flex bg-[#fafaf9] text-zinc-900 antialiased selection:bg-zinc-200">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 bottom-0 left-0 z-50 transform md:hidden transition-transform duration-200 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
      </div>

      {/* Main Viewport Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Mobile Header Bar with Menu Toggle */}
        <div className="md:hidden h-12 px-4 bg-white border-b border-zinc-200/80 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-zinc-600 hover:text-zinc-900 rounded"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
          <div className="text-xs font-semibold text-zinc-900">AEROVEDA</div>
          <div className="w-6" />
        </div>

        {/* Top Header Bar */}
        <TopBar activeTab={activeTab} />

        {/* Quiet Simulated Environment Note */}
        <DemoBanner />

        {/* Active Page View */}
        <main className="flex-1 pb-16">
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
