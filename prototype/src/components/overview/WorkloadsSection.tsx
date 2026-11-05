import React, { useState } from 'react';
import { useServer } from '../../context/ServerContext';
import { DockerApp } from '../../types/server';
import { Badge } from '../ui/Badge';
import {
  Boxes,
  Play,
  Square,
  RotateCw,
  FileText,
  ExternalLink,
  Film,
  Camera,
  Cloud,
  Shield,
  Layers,
  Activity,
  Cpu,
  Monitor,
} from 'lucide-react';

export const WorkloadsSection: React.FC = () => {
  const { state, openDrawer, startApp, stopApp, restartApp, showToast } = useServer();
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
        return <Film size={18} />;
      case 'camera':
        return <Camera size={18} />;
      case 'cloud':
        return <Cloud size={18} />;
      case 'shield':
        return <Shield size={18} />;
      case 'layers':
        return <Layers size={18} />;
      case 'activity':
        return <Activity size={18} />;
      default:
        return <Boxes size={18} />;
    }
  };

  const handleLaunchWebUi = (app: DockerApp) => {
    if (app.state !== 'running') {
      showToast(`Cannot launch ${app.name}: container is stopped.`, 'warning');
      return;
    }
    showToast(
      `[DEMO] Simulated WebUI for ${app.name} (Port :${app.webUiPort}). Real Unraid connections are disabled.`,
      'info'
    );
  };

  return (
    <section className="card" style={{ marginBottom: 'var(--space-md)' }} aria-labelledby="workloads-title">
      <div className="card-header" style={{ flexWrap: 'wrap' }}>
        <div className="card-title-group">
          <Boxes size={18} color="var(--accent)" />
          <div>
            <h2 id="workloads-title" className="card-title">
              Apps & Virtual Machines
            </h2>
            <div className="card-subtitle">
              {runningCount} Running · {stoppedCount} Standby {errorCount > 0 && `· ${errorCount} Error`}
            </div>
          </div>
        </div>

        {/* Filter pills */}
        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-surface-inset)', padding: '2px', borderRadius: 'var(--radius-sm)' }}>
          <button
            onClick={() => setFilter('all')}
            className={`btn btn-sm ${filter === 'all' ? 'btn-secondary' : 'btn-ghost'}`}
            style={{ padding: '3px 8px', fontSize: '11px' }}
            type="button"
          >
            All ({state.apps.length})
          </button>
          <button
            onClick={() => setFilter('running')}
            className={`btn btn-sm ${filter === 'running' ? 'btn-secondary' : 'btn-ghost'}`}
            style={{ padding: '3px 8px', fontSize: '11px' }}
            type="button"
          >
            Running ({runningCount})
          </button>
          <button
            onClick={() => setFilter('stopped')}
            className={`btn btn-sm ${filter === 'stopped' ? 'btn-secondary' : 'btn-ghost'}`}
            style={{ padding: '3px 8px', fontSize: '11px' }}
            type="button"
          >
            Stopped ({stoppedCount})
          </button>
        </div>
      </div>

      {/* Apps Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '12px',
        }}
      >
        {filteredApps.map((app) => {
          const isRunning = app.state === 'running';
          const isError = app.state === 'error';
          const isRestarting = app.state === 'restarting';

          let statusBadge = <Badge variant="neutral">Standby</Badge>;
          if (isRunning) statusBadge = <Badge variant="healthy">Running</Badge>;
          if (isError) statusBadge = <Badge variant="danger">Crash</Badge>;
          if (isRestarting) statusBadge = <Badge variant="info">Restarting</Badge>;

          return (
            <div
              key={app.id}
              style={{
                background: 'var(--bg-surface-raised)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-md)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '12px',
                transition: 'border-color var(--transition-fast)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 'var(--radius-sm)',
                        background: isRunning ? 'var(--accent-subtle)' : 'var(--bg-surface-inset)',
                        color: isRunning ? 'var(--accent)' : 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {getAppIcon(app.icon)}
                    </div>

                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13px' }}>{app.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {app.version} {app.uptime && `· ${app.uptime}`}
                      </div>
                    </div>
                  </div>

                  {statusBadge}
                </div>

                {/* Resource consumption if running */}
                {isRunning && (
                  <div
                    style={{
                      display: 'flex',
                      gap: '12px',
                      fontSize: '11px',
                      color: 'var(--text-secondary)',
                      background: 'var(--bg-surface-inset)',
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-xs)',
                    }}
                  >
                    <span>CPU: <strong style={{ color: 'var(--text-primary)' }}>{app.cpuPercent}%</strong></span>
                    <span>RAM: <strong style={{ color: 'var(--text-primary)' }}>{Math.round(app.memBytes / (1024 * 1024))} MB</strong></span>
                    {app.webUiPort && <span className="text-mono">Port :{app.webUiPort}</span>}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '8px',
                  gap: '6px',
                }}
              >
                <div style={{ display: 'flex', gap: '4px' }}>
                  {app.hasWebUi && (
                    <button
                      onClick={() => handleLaunchWebUi(app)}
                      disabled={!isRunning}
                      className="btn btn-secondary btn-sm"
                      title="Launch Web Interface (Simulated Demo)"
                      type="button"
                    >
                      <ExternalLink size={12} />
                      <span>Web UI</span>
                    </button>
                  )}

                  <button
                    onClick={() => openDrawer({ type: 'app', appId: app.id })}
                    className="btn btn-ghost btn-sm"
                    title="View Container Logs & Details"
                    type="button"
                  >
                    <FileText size={12} />
                    <span>Logs</span>
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '4px' }}>
                  {isRunning ? (
                    <>
                      <button
                        onClick={() => restartApp(app.id)}
                        className="btn btn-ghost btn-sm"
                        title="Restart Container"
                        type="button"
                      >
                        <RotateCw size={12} />
                      </button>
                      <button
                        onClick={() => stopApp(app.id)}
                        className="btn btn-secondary btn-sm"
                        style={{ color: 'var(--text-muted)' }}
                        title="Stop Container"
                        type="button"
                      >
                        <Square size={12} />
                        <span>Stop</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => startApp(app.id)}
                      className="btn btn-primary btn-sm"
                      title="Start Container"
                      type="button"
                    >
                      <Play size={12} />
                      <span>Start</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* VM section compact card */}
      {state.vms.length > 0 && (
        <div
          style={{
            marginTop: '16px',
            paddingTop: '12px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Monitor size={16} color="var(--text-secondary)" />
            <div>
              <span style={{ fontWeight: 600, fontSize: '12px' }}>
                Virtual Machine: {state.vms[0].name}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: 6 }}>
                ({state.vms[0].vCpuCount} vCPU, {state.vms[0].allocatedRamGiB} GiB RAM)
              </span>
            </div>
            <Badge variant="neutral" showDot={false}>
              {state.vms[0].state.toUpperCase()}
            </Badge>
          </div>

          <button
            onClick={() => showToast('[DEMO] VM Start is simulated in this research build.', 'info')}
            className="btn btn-secondary btn-sm"
            type="button"
          >
            <Play size={12} />
            <span>Start VM</span>
          </button>
        </div>
      )}
    </section>
  );
};

