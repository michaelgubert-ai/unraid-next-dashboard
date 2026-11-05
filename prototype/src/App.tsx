import React, { useState } from 'react';
import { ServerProvider, useServer } from './context/ServerContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { FogBackground } from './components/layout/FogBackground';
import { MobileNav } from './components/layout/MobileNav';
import { StubView } from './components/layout/StubView';
import { StorageSharesView } from './components/storage/StorageSharesView';
import { AttentionBanner } from './components/overview/AttentionBanner';
import { StorageHeroCard } from './components/overview/StorageHeroCard';
import { RecentEventsCard } from './components/overview/RecentEventsCard';
import { CircularTelemetryCol } from './components/overview/CircularTelemetryCol';
import { AppsGridSection } from './components/overview/AppsGridSection';
import { DiskDetailDrawer } from './components/details/DiskDetailDrawer';
import { AppDetailModal } from './components/details/AppDetailModal';
import { ResourcesDrawer } from './components/details/ResourcesDrawer';
import { ParityActionModal } from './components/details/ParityActionModal';
import { ToastContainer } from './components/ui/Toast';

const DashboardContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(true);
  const { activeDrawer } = useServer();

  return (
    <div className={`app-container ${sidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
      {/* Dynamic Mountain & Fog Animated Background */}
      <FogBackground />

      {/* Floating Capsule Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Layout Area */}
      <div className="app-main">
        {/* Compact Header: Server, Status, Activity Tray & Demo Menu */}
        <Header
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Main Content Area */}
        <main className="app-content">
          {currentTab === 'overview' ? (
            <div className="overview-centered-workspace">
              {/* Priority Attention Banner (if alert or active parity check) */}
              <AttentionBanner />

              {/* Upper Center Row: Orange Storage Box + Recent Events + 4 Circular Telemetry */}
              <div className="overview-center-top-row">
                <StorageHeroCard />
                <RecentEventsCard />
                <CircularTelemetryCol />
              </div>

              {/* Lower Area: Apps / Docker Launcher Dock */}
              <AppsGridSection />
            </div>
          ) : currentTab === 'storage' ? (
            <StorageSharesView onBackToOverview={() => setCurrentTab('overview')} />
          ) : (
            <StubView tabId={currentTab} onBackToOverview={() => setCurrentTab('overview')} />
          )}
        </main>

        {/* Mobile Navigation */}
        <MobileNav
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onOpenMenu={() => setMobileMenuOpen(true)}
        />
      </div>

      {/* Level 3 Slide-over Drawers & Modals */}
      {activeDrawer?.type === 'disk' && <DiskDetailDrawer diskId={activeDrawer.diskId} />}
      {activeDrawer?.type === 'app' && <AppDetailModal appId={activeDrawer.appId} />}
      {activeDrawer?.type === 'resources' && <ResourcesDrawer />}
      {activeDrawer?.type === 'array_action' && <ParityActionModal />}

      {/* Action Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <ServerProvider>
      <DashboardContent />
    </ServerProvider>
  );
}

export default App;
