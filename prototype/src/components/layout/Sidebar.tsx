import React, { useState } from 'react';
import { useServer } from '../../context/ServerContext';
import {
  LayoutDashboard,
  HardDrive,
  Boxes,
  Cpu,
  History,
  Settings,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile = false,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse,
}) => {
  const { state, showToast } = useServer();
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      active: currentTab === 'overview',
      count: undefined,
    },
    {
      id: 'storage',
      label: 'Storage',
      icon: HardDrive,
      active: currentTab === 'storage',
      count: '8 TB',
      stub: false,
    },
    {
      id: 'apps',
      label: 'Apps',
      icon: Boxes,
      active: currentTab === 'apps',
      count: `${state.apps.filter((a) => a.state === 'running').length}`,
      stub: true,
      hint: 'Community catalog & Docker topology. Managed directly on Overview.',
    },
    {
      id: 'vms',
      label: 'Virtual Machines',
      icon: Cpu,
      active: currentTab === 'vms',
      count: state.vms.length > 0 ? `${state.vms.length}` : undefined,
      stub: true,
      hint: 'KVM hypervisor and pass-through console.',
    },
    {
      id: 'activity',
      label: 'Activity',
      icon: History,
      active: currentTab === 'activity',
      count: undefined,
      stub: true,
      hint: 'System event audits. Recent events are in the top header tray.',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      active: currentTab === 'settings',
      count: undefined,
      stub: true,
      hint: 'Server settings & plugin configurations.',
    },
  ];

  const handleNavClick = (item: (typeof navItems)[0]) => {
    if (item.stub) {
      showToast(`${item.label}: ${item.hint}`, 'info');
      onSelectTab(item.id);
    } else {
      onSelectTab(item.id);
    }
    if (onCloseMobile) onCloseMobile();
  };

  /* ─── Render Desktop Floating Capsule Navigation (Collapsed Mode) ─── */
  const renderFloatingCapsule = () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '100%',
        width: '100%',
        padding: '14px 6px',
        boxSizing: 'border-box',
      }}
    >
      {/* Top: Brand Logo */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '11px',
            background: 'linear-gradient(135deg, #ff6b35 0%, #d94814 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: '15px',
            boxShadow: '0 2px 10px rgba(255, 107, 53, 0.45)',
            cursor: 'pointer',
          }}
          title="Unraid OS"
          onClick={() => onSelectTab('overview')}
        >
          U
        </div>

        {/* Subtle hairline divider */}
        <div
          style={{
            width: 20,
            height: 1,
            background: 'rgba(255, 255, 255, 0.10)',
            margin: '12px auto 6px',
          }}
        />
      </div>

      {/* Middle: Vertical Stack of Navigation Icons */}
      <nav
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          margin: 'auto 0',
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isItemActive = item.active;

          return (
            <div key={item.id} style={{ position: 'relative' }}>
              <button
                data-tab-id={item.id}
                onClick={() => handleNavClick(item)}
                onMouseEnter={() => setHoveredTab(item.id)}
                onMouseLeave={() => setHoveredTab(null)}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isItemActive ? 'var(--accent)' : 'transparent',
                  color: isItemActive ? '#ffffff' : 'var(--text-muted)',
                  boxShadow: isItemActive ? '0 4px 16px rgba(255, 107, 53, 0.45)' : 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
                type="button"
                aria-label={item.label}
              >
                <Icon size={18} strokeWidth={isItemActive ? 2.3 : 1.8} />
              </button>

              {/* Pierre Sù / Dock Style Hover Tooltip */}
              {hoveredTab === item.id && (
                <div
                  style={{
                    position: 'absolute',
                    left: 'calc(100% + 12px)',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(18, 20, 28, 0.96)',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '5px 11px',
                    borderRadius: '8px',
                    whiteSpace: 'nowrap',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    boxShadow: '0 4px 18px rgba(0, 0, 0, 0.55)',
                    pointerEvents: 'none',
                    zIndex: 60,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>{item.label}</span>
                  {item.count && (
                    <span
                      style={{
                        fontSize: '9px',
                        background: 'rgba(255, 255, 255, 0.15)',
                        padding: '1px 5px',
                        borderRadius: '4px',
                        color: '#ffa066',
                      }}
                    >
                      {item.count}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom: Subtle expand toggle button */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div
          style={{
            width: 20,
            height: 1,
            background: 'rgba(255, 255, 255, 0.10)',
            margin: '6px auto 10px',
          }}
        />

        <button
          onClick={onToggleCollapse}
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            color: 'var(--text-muted)',
            border: 'none',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
          }}
          title="Expand sidebar"
          type="button"
          aria-label="Expand sidebar"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );

  /* ─── Render Expanded Floating Box Navigation (or Mobile Drawer) ─── */
  const renderExpandedPanel = (mobileDrawer: boolean) => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        width: '100%',
        padding: mobileDrawer ? '16px' : '14px 10px',
        boxSizing: 'border-box',
      }}
    >
      <div>
        {/* Brand Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '4px 6px 12px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '9px',
                background: 'linear-gradient(135deg, #ff6b35 0%, #d94814 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 800,
                fontSize: '14px',
                boxShadow: '0 2px 8px rgba(255, 107, 53, 0.35)',
                flexShrink: 0,
              }}
            >
              U
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '13px', letterSpacing: '-0.01em', color: 'var(--text-primary)' }}>
                UNRAID
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>OS v7.3.2</div>
            </div>
          </div>

          {mobileDrawer ? (
            <button
              onClick={onCloseMobile}
              className="btn-ghost"
              style={{ padding: 6, color: 'var(--text-secondary)' }}
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          ) : (
            <button
              onClick={onToggleCollapse}
              style={{
                padding: '6px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                borderRadius: '6px',
              }}
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </div>

        {/* Navigation List */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isItemActive = item.active;

            return (
              <button
                key={item.id}
                data-tab-id={item.id}
                onClick={() => handleNavClick(item)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '9px 12px',
                  borderRadius: '12px',
                  background: isItemActive ? 'rgba(255, 107, 53, 0.14)' : 'transparent',
                  color: isItemActive ? 'var(--text-primary)' : 'var(--text-muted)',
                  border: isItemActive ? '1px solid rgba(255, 107, 53, 0.35)' : '1px solid transparent',
                  fontWeight: isItemActive ? 600 : 500,
                  fontSize: '13px',
                  transition: 'all var(--transition-fast)',
                  cursor: 'pointer',
                  width: '100%',
                }}
                type="button"
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '7px',
                    background: isItemActive ? 'var(--accent)' : 'transparent',
                    color: isItemActive ? '#fff' : 'currentColor',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={15} />
                </div>
                <span style={{ flex: 1, textAlign: 'left', whiteSpace: 'nowrap' }}>
                  {item.label}
                </span>
                {item.count && (
                  <span
                    style={{
                      fontSize: '10px',
                      background: 'var(--bg-surface-raised)',
                      padding: '1px 6px',
                      borderRadius: 'var(--radius-pill)',
                      color: isItemActive ? '#ffa066' : 'var(--text-muted)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom: Server Identity Footprint */}
      <div
        style={{
          padding: '10px 6px 4px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          fontSize: '10px',
          color: 'var(--text-muted)',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
        }}
      >
        <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{state.info.hostname}</span>
        <span>{state.resources.network.ipAddress}</span>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Floating Sidebar (Pill Dock / Box Floating Style) */}
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : 'expanded'}`}>
        {isCollapsed ? renderFloatingCapsule() : renderExpandedPanel(false)}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="drawer-backdrop" onClick={onCloseMobile} style={{ justifyContent: 'flex-start' }}>
          <div
            className="drawer-content"
            style={{
              maxWidth: 260,
              borderRight: '1px solid var(--border-medium)',
              borderLeft: 'none',
              animation: 'slideInLeft 180ms ease',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {renderExpandedPanel(true)}
          </div>
        </div>
      )}
    </>
  );
};
