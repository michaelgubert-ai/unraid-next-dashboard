import React from 'react';
import { LayoutDashboard, HardDrive, Boxes, Menu } from 'lucide-react';

interface MobileNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenMenu: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenMenu,
}) => {
  return (
    <nav className="mobile-nav" aria-label="Mobile Navigation">
      <button
        onClick={() => onSelectTab('overview')}
        className={`mobile-nav-btn ${currentTab === 'overview' ? 'active' : ''}`}
        type="button"
      >
        <LayoutDashboard size={20} />
        <span>Overview</span>
      </button>

      <button
        onClick={() => onSelectTab('storage')}
        className={`mobile-nav-btn ${currentTab === 'storage' ? 'active' : ''}`}
        type="button"
      >
        <HardDrive size={20} />
        <span>Storage</span>
      </button>

      <button
        onClick={() => onSelectTab('apps')}
        className={`mobile-nav-btn ${currentTab === 'apps' ? 'active' : ''}`}
        type="button"
      >
        <Boxes size={20} />
        <span>Apps</span>
      </button>

      <button
        onClick={onOpenMenu}
        className="mobile-nav-btn"
        type="button"
        aria-label="Open full menu"
      >
        <Menu size={20} />
        <span>Menu</span>
      </button>
    </nav>
  );
};

