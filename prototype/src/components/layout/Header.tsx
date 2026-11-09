import React, { useState, useRef, useEffect } from 'react';
import { useServer } from '../../context/ServerContext';
import { SCENARIO_LIST, ScenarioType } from '../../types/scenario';
import { Badge } from '../ui/Badge';
import {
  Server,
  Sliders,
  WifiOff,
  Clock,
  Shield,
  Bell,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react';

interface HeaderProps {
  onOpenMobileMenu?: () => void;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const { state, isLive, scenario, setScenario, resetDemo, openDrawer } = useServer();
  const [showActivityTray, setShowActivityTray] = useState(false);
  const trayRef = useRef<HTMLDivElement>(null);

  const isStale = state.connectionStatus === 'stale';

  let parityVariant: 'healthy' | 'warning' | 'info' | 'danger' = 'healthy';
  let parityLabel = 'Parity Valid';
  if (state.storage.array.parityStatus === 'checking') {
    parityVariant = 'info';
    parityLabel = 'Checking';
  } else if (state.storage.array.parityStatus === 'degraded') {
    parityVariant = 'warning';
    parityLabel = 'Degraded';
  } else if (state.storage.array.status === 'warning') {
    parityVariant = 'warning';
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (trayRef.current && !trayRef.current.contains(event.target as Node)) {
        setShowActivityTray(false);
      }
    }
    if (showActivityTray) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showActivityTray]);

  return (
    <header className="top-header">
      {/* Left: Server Identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          onClick={onOpenMobileMenu}
          className="btn-ghost header-menu-btn"
          style={{ padding: '6px' }}
          aria-label="Open Mobile Menu"
        >
          <Server size={16} color="var(--text-secondary)" />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text-primary)' }}>
            {state.info.hostname}
          </span>
          <span className="text-muted header-os-version" style={{ fontSize: '11px' }}>
            {state.info.unraidVersion || 'v7.3.2'}
          </span>
        </div>

        {isLive && (
          <Badge variant="healthy">
            <CheckCircle2 size={10} style={{ marginRight: 2 }} />
            Live Unraid
          </Badge>
        )}

        <Badge variant={parityVariant}>
          <Shield size={10} style={{ marginRight: 1 }} />
          {parityLabel}
        </Badge>

        {isStale && (
          <Badge variant="warning">
            <WifiOff size={10} style={{ marginRight: 1 }} />
            Cached
          </Badge>
        )}
      </div>

      {/* Right: Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div className="header-uptime" style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Clock size={11} />
          <span>{state.info.uptime}</span>
        </div>

        <button
          onClick={() => openDrawer({ type: 'array_action' })}
          className="btn btn-secondary btn-sm"
          style={{ padding: '4px 10px', fontSize: '11px', gap: '5px' }}
          type="button"
          title="Array maintenance & disk power controls"
        >
          <Sliders size={12} />
          <span className="hide-on-mobile">Array Actions</span>
        </button>

        {/* Activity Tray */}
        <div style={{ position: 'relative' }} ref={trayRef}>
          <button
            onClick={() => setShowActivityTray(!showActivityTray)}
            className="btn btn-ghost btn-sm"
            style={{ padding: '5px 7px', position: 'relative' }}
            aria-label="Recent activity log"
            aria-expanded={showActivityTray}
            title="Recent activity"
            type="button"
          >
            <Bell size={14} color="var(--text-secondary)" />
            {state.activityLog.length > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  background: 'var(--accent)',
                }}
              />
            )}
          </button>

          {/* Activity Popover */}
          {showActivityTray && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '300px',
                background: 'var(--bg-surface-overlay)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 60,
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                animation: 'fadeIn 120ms ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>Recent Activity</span>
                <button onClick={() => setShowActivityTray(false)} className="btn-ghost" style={{ padding: 2 }}>
                  <X size={12} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '220px', overflowY: 'auto' }}>
                {state.activityLog.map((act) => {
                  let Icon = CheckCircle2;
                  let color = 'var(--status-healthy)';
                  if (act.status === 'warning') {
                    Icon = AlertTriangle;
                    color = 'var(--status-warning)';
                  } else if (act.status === 'info') {
                    Icon = Info;
                    color = 'var(--status-info)';
                  }

                  return (
                    <div
                      key={act.id}
                      style={{
                        padding: '6px 8px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-surface-raised)',
                        fontSize: '11px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          <Icon size={10} color={color} />
                          <span>{act.title}</span>
                        </div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{act.timeAgo}</span>
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '10px' }}>{act.detail}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* DEMO Scenario Selector */}
        <div
          className="header-demo-container"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'var(--bg-surface-raised)',
            padding: '3px 6px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--accent-border)',
          }}
        >
          <span
            className="hide-on-mobile"
            style={{
              background: 'var(--accent)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '8px',
              padding: '1px 4px',
              borderRadius: '3px',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            Demo
          </span>

          <select
            value={scenario}
            onChange={(e) => setScenario(e.target.value as ScenarioType)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '11px',
              fontWeight: 500,
              cursor: 'pointer',
              padding: '1px 2px',
              outline: 'none',
              maxWidth: '95px',
            }}
            aria-label="Select Demo Scenario"
          >
            {SCENARIO_LIST.map((sc) => (
              <option key={sc.id} value={sc.id} style={{ background: '#1c1f28', color: '#fff' }}>
                {sc.title}
              </option>
            ))}
          </select>

          <button
            onClick={resetDemo}
            className="btn-ghost"
            style={{ padding: '2px', color: 'var(--text-muted)' }}
            title="Reset state"
            type="button"
            aria-label="Reset State"
          >
            <RotateCcw size={11} />
          </button>
        </div>
      </div>
    </header>
  );
};
