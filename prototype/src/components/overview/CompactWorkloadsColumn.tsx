import React, { useState } from 'react';
import { useServer } from '../../context/ServerContext';
import { DockerApp } from '../../types/server';
import { Badge } from '../ui/Badge';
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
} from 'lucide-react';

export const CompactWorkloadsColumn: React.FC = () => {
  const { state, openDrawer, startApp, stopApp, showToast } = useServer();
  const [filter, setFilter] = useState<'all' | 'running' | 'stopped'>('all');

  const runningCount = state.apps.filter((a) => a.state === 'running').length;
  const stoppedCount = state.apps.filter((a) => a.state === 'stopped').length;
  const errorCount = state.apps.filter((a) => a.state === 'error').length;

  const filteredApps = state.apps.filter((app) => {
    if (filter === 'running') return app.state === 'running';
    if (filter === 'stopped') return app.state === 'stopped' || app.state === 'error';
    return true;
  });

  const getAppIcon = (iconName: string) => {
    switch (iconName) {
      case 'film':
        return <Film size={13} />;
      case 'camera':
        return <Camera size={13} />;
      case 'cloud':
        return <Cloud size={13} />;
      case 'shield':
        return <Shield size={13} />;
      case 'layers':
        return <Layers size={13} />;
      case 'activity':
        return <Activity size={13} />;
      default:
        return <Boxes size={13} />;
    }
  };

  const handleLaunchWebUi = (e: React.MouseEvent, app: DockerApp) => {
    e.stopPropagation();
    if (app.state !== 'running') {
      showToast(`Cannot launch ${app.name}: container is stopped.`, 'warning');
      return;
    }
    showToast(
      `[DEMO] Simulated WebUI for ${app.name} on port :${app.webUiPort}. Real connections disabled.`,
      'info'
    );
  };

  return (
    <div
      className="card"
      style={{
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        height: '100%',
      }}
      role="region"
      aria-label="Applications and Workloads"
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Boxes size={15} color="var(--accent)" />
          <span style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '-0.01em' }}>Apps & Workloads</span>
          <span className="text-muted" style={{ fontSize: '11px' }}>
            ({runningCount} Active · {stoppedCount} Standby{errorCount > 0 ? ` · ${errorCount} Crash` : ''})
          </span>
        </div>

        {/* Filter Pills */}
        <div
          style={{
            display: 'flex',
            gap: '2px',
            background: 'var(--bg-surface-inset)',
            padding: '2px',
            borderRadius: 'var(--radius-xs)',
          }}
        >
          <button
            onClick={() => setFilter('all')}
            className={`btn btn-sm ${filter === 'all' ? 'btn-secondary' : 'btn-ghost'}`}
            style={{ padding: '2px 6px', fontSize: '10px' }}
            type="button"
          >
            All ({state.apps.length})
          </button>
          <button
            onClick={() => setFilter('running')}
            className={`btn btn-sm ${filter === 'running' ? 'btn-secondary' : 'btn-ghost'}`}
            style={{ padding: '2px 6px', fontSize: '10px' }}
            type="button"
          >
            Run ({runningCount})
          </button>
          <button
            onClick={() => setFilter('stopped')}
            className={`btn btn-sm ${filter === 'stopped' ? 'btn-secondary' : 'btn-ghost'}`}
            style={{ padding: '2px 6px', fontSize: '10px' }}
            type="button"
          >
            Stop ({stoppedCount})
          </button>
        </div>
      </div>

      {/* Compact Apps List (Row-based, not bulky cards!) */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          flex: 1,
        }}
      >
        {filteredApps.map((app) => {
          const isRunning = app.state === 'running';
          const isError = app.state === 'error';

          return (
            <div
              key={app.id}
              className="compact-app-row"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 8px',
                background: 'var(--bg-surface-raised)',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--border-subtle)',
                fontSize: '11px',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                gap: '8px',
              }}
              onClick={() => openDrawer({ type: 'app', appId: app.id })}
              role="button"
              tabIndex={0}
              aria-label={`View logs and details for ${app.name}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  openDrawer({ type: 'app', appId: app.id });
                }
              }}
            >
              {/* Left: Icon & Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '4px',
                    background: isRunning ? 'var(--accent-subtle)' : 'var(--bg-surface-inset)',
                    color: isRunning ? 'var(--accent)' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {getAppIcon(app.icon)}
                </div>

                <div style={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                    {app.name}
                  </span>
                  {app.uptime && (
                    <span className="text-muted hide-on-narrow" style={{ fontSize: '10px' }}>
                      · {app.uptime}
                    </span>
                  )}
                </div>
              </div>

              {/* Middle: Resource consumption if running */}
              {isRunning && (
                <div className="text-mono hide-on-narrow" style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', gap: '6px' }}>
                  <span>{app.cpuPercent}% CPU</span>
                  <span>{Math.round(app.memBytes / (1024 * 1024))}M</span>
                </div>
              )}

              {/* Right: Status Pill & Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                {isRunning ? (
                  <Badge variant="healthy" showDot={true} className="disk-badge-compact">
                    Active
                  </Badge>
                ) : isError ? (
                  <Badge variant="danger" showDot={true} className="disk-badge-compact">
                    Crash
                  </Badge>
                ) : (
                  <span className="text-muted" style={{ fontSize: '10px' }}>Standby</span>
                )}

                {/* Web UI Button */}
                {app.hasWebUi && (
                  <button
                    onClick={(e) => handleLaunchWebUi(e, app)}
                    disabled={!isRunning}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '2px 5px', fontSize: '10px', height: '20px' }}
                    title={isRunning ? `Launch Web UI (:${app.webUiPort})` : 'Web UI unavailable (stopped)'}
                    type="button"
                  >
                    <ExternalLink size={10} />
                  </button>
                )}

                {/* Start / Stop Toggle */}
                {isRunning ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      stopApp(app.id);
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '2px 6px', fontSize: '10px', height: '20px', color: 'var(--text-muted)' }}
                    title="Stop container"
                    type="button"
                  >
                    <Square size={9} />
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startApp(app.id);
                    }}
                    className="btn btn-primary btn-sm"
                    style={{ padding: '2px 6px', fontSize: '10px', height: '20px' }}
                    title="Start container"
                    type="button"
                  >
                    <Play size={9} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* VM Row (Compact) */}
      {state.vms.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '6px',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '11px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Monitor size={13} color="var(--text-secondary)" />
            <span style={{ fontWeight: 600 }}>VM: {state.vms[0].name}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
              ({state.vms[0].vCpuCount} vCPU, {state.vms[0].allocatedRamGiB}G)
            </span>
            <span className="badge badge-neutral" style={{ fontSize: '9px', padding: '1px 4px' }}>
              {state.vms[0].state}
            </span>
          </div>

          <button
            onClick={() => showToast('[DEMO] VM Start is simulated in this build.', 'info')}
            className="btn btn-secondary btn-sm"
            style={{ padding: '2px 6px', fontSize: '10px', height: '20px' }}
            type="button"
          >
            <Play size={9} style={{ marginRight: 3 }} />
            <span>Start VM</span>
          </button>
        </div>
      )}
    </div>
  );
};

