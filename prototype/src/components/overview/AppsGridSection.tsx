import React, { useState } from 'react';
import { useServer } from '../../context/ServerContext';
import { DockerApp } from '../../types/server';
import {
  Boxes,
  Play,
  Square,
  RotateCw,
  ExternalLink,
  Film,
  Camera,
  Cloud,
  Shield,
  Layers,
  Activity,
  Monitor,
  FileText,
  MoreVertical,
  Plus,
  Home,
  Download,
  Tv,
  Globe,
  Cpu,
} from 'lucide-react';

export const AppsGridSection: React.FC = () => {
  const { state, openDrawer, startApp, stopApp, restartApp, showToast } = useServer();
  const [activeMenuAppId, setActiveMenuAppId] = useState<string | null>(null);

  const getAppIcon = (iconName: string) => {
    switch (iconName) {
      case 'film':
        return <Film size={19} />;
      case 'camera':
        return <Camera size={19} />;
      case 'cloud':
        return <Cloud size={19} />;
      case 'shield':
        return <Shield size={19} />;
      case 'layers':
        return <Layers size={19} />;
      case 'activity':
        return <Activity size={19} />;
      case 'home':
        return <Home size={19} />;
      case 'download':
        return <Download size={19} />;
      case 'tv':
        return <Tv size={19} />;
      case 'globe':
        return <Globe size={19} />;
      case 'cpu':
        return <Cpu size={19} />;
      default:
        return <Boxes size={19} />;
    }
  };

  const handlePrimaryAppClick = (app: DockerApp) => {
    if (app.state === 'running' && app.hasWebUi) {
      showToast(
        `[DEMO] Simulating Web UI launch for ${app.name} (:${app.webUiPort}).`,
        'info'
      );
    } else if (app.state === 'stopped') {
      startApp(app.id);
    } else {
      openDrawer({ type: 'app', appId: app.id });
    }
  };

  const runningCount = state.apps.filter((a) => a.state === 'running').length;
  const stoppedCount = state.apps.filter((a) => a.state === 'stopped').length;
  const errorCount = state.apps.filter((a) => a.state === 'error').length;

  return (
    <div
      className="card apps-grid-card"
      style={{
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        width: '100%',
        borderRadius: 'var(--radius-lg)',
        background: 'rgba(18, 20, 28, 0.86)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.55)',
      }}
      role="region"
      aria-label="Applications"
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Boxes size={16} color="var(--accent)" />
          <span style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text-primary)' }}>
            Applications & Workloads
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            ({runningCount} Active{stoppedCount > 0 ? ` · ${stoppedCount} Standby` : ''}{errorCount > 0 ? ` · ${errorCount} Attention` : ''})
          </span>
        </div>

        {/* Right side info & add app action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {state.vms.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--text-muted)' }}>
              <Monitor size={13} color="var(--text-secondary)" />
              <span>Hypervisor: <strong style={{ color: 'var(--text-primary)' }}>{state.vms.length} VMs</strong></span>
            </div>
          )}

          <button
            onClick={() => showToast('[DEMO] Community Applications catalog peek.', 'info')}
            className="btn btn-secondary btn-sm"
            style={{ padding: '3px 8px', fontSize: '11px', gap: '4px' }}
            type="button"
            title="Browse Community Applications"
          >
            <Plus size={12} />
            <span className="hide-on-mobile">Add App</span>
          </button>
        </div>
      </div>

      {/* Clean Launchpad-style App Icons (macOS / ZimaOS / iPad style) */}
      <div className="apps-launcher-grid">
        {state.apps.map((app) => {
          const isRunning = app.state === 'running';
          const isError = app.state === 'error';

          let statusDotColor = 'var(--text-muted)';
          if (isRunning) statusDotColor = '#22c55e';
          if (isError) statusDotColor = '#ef4444';

          return (
            <div
              key={app.id}
              onClick={() => handlePrimaryAppClick(app)}
              role="button"
              tabIndex={0}
              aria-label={`${app.name}, status: ${app.state}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                cursor: 'pointer',
                userSelect: 'none',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                width: '100%',
                maxWidth: '120px',
                transition: 'transform 160ms ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-3px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              {/* Squircle App Icon */}
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: '13px',
                  background: isRunning
                    ? 'linear-gradient(135deg, rgba(255, 107, 53, 0.20) 0%, rgba(255, 107, 53, 0.06) 100%)'
                    : 'rgba(255, 255, 255, 0.04)',
                  border: isRunning
                    ? '1px solid rgba(255, 107, 53, 0.35)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: isRunning ? '0 4px 14px rgba(255, 107, 53, 0.2)' : '0 2px 6px rgba(0, 0, 0, 0.2)',
                  color: isRunning ? 'var(--accent)' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  flexShrink: 0,
                  transition: 'all 160ms ease',
                }}
              >
                {getAppIcon(app.icon)}

                {/* Subtle active / status dot */}
                <span
                  style={{
                    position: 'absolute',
                    top: '3px',
                    right: '3px',
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: statusDotColor,
                    boxShadow: isRunning ? '0 0 6px rgba(34, 197, 94, 0.6)' : 'none',
                  }}
                  title={`Status: ${app.state}`}
                />
              </div>

              {/* Clean App Title below */}
              <div
                style={{
                  marginTop: '8px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  color: isRunning ? 'var(--text-primary)' : 'var(--text-secondary)',
                  width: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  textAlign: 'center',
                  lineHeight: 1.2,
                }}
                title={app.name}
              >
                {app.name}
              </div>
            </div>
          );
        })}

        {/* VMs as clean launcher icons */}
        {state.vms.map((vm) => (
          <div
            key={vm.id}
            onClick={() => showToast(`[DEMO] VM Console: ${vm.name}`, 'info')}
            role="button"
            tabIndex={0}
            aria-label={`${vm.name}, VM`}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              cursor: 'pointer',
              userSelect: 'none',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              width: '100%',
              maxWidth: '120px',
              transition: 'transform 160ms ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-3px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <div
              style={{
                width: 50,
                height: 50,
                borderRadius: '13px',
                background: vm.state === 'running'
                  ? 'linear-gradient(135deg, rgba(255, 160, 102, 0.20) 0%, rgba(255, 160, 102, 0.06) 100%)'
                  : 'rgba(255, 255, 255, 0.04)',
                border: vm.state === 'running'
                  ? '1px solid rgba(255, 160, 102, 0.35)'
                  : '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: vm.state === 'running' ? '0 4px 14px rgba(255, 160, 102, 0.2)' : '0 2px 6px rgba(0, 0, 0, 0.2)',
                color: vm.state === 'running' ? '#ffa066' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                flexShrink: 0,
              }}
            >
              <Monitor size={22} />
              <span
                style={{
                  position: 'absolute',
                  top: '3px',
                  right: '3px',
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: vm.state === 'running' ? '#22c55e' : 'var(--text-muted)',
                }}
              />
            </div>
            <div
              style={{
                marginTop: '8px',
                fontSize: '11.5px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                width: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                textAlign: 'center',
                lineHeight: 1.2,
              }}
              title={vm.name}
            >
              {vm.name}
            </div>
          </div>
        ))}

        {/* Add App Icon */}
        <div
          onClick={() => showToast('[DEMO] Browse Community Applications catalog.', 'info')}
          role="button"
          tabIndex={0}
          title="Add new container"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            cursor: 'pointer',
            userSelect: 'none',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            width: '100%',
            maxWidth: '120px',
            transition: 'transform 160ms ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-3px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: '13px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1.5px dashed rgba(255, 255, 255, 0.2)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Plus size={20} />
          </div>
          <div
            style={{
              marginTop: '8px',
              fontSize: '11.5px',
              fontWeight: 600,
              color: 'var(--text-muted)',
              width: '100%',
              textAlign: 'center',
              lineHeight: 1.2,
            }}
          >
            Add App
          </div>
        </div>
      </div>
    </div>
  );
};
