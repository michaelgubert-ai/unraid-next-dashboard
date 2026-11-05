import React from 'react';
import { useServer } from '../../context/ServerContext';
import { Badge } from '../ui/Badge';
import {
  Boxes,
  Play,
  Square,
  RotateCw,
  ExternalLink,
  X,
  Terminal,
  Cpu,
  Database,
} from 'lucide-react';

interface AppDetailModalProps {
  appId: string;
}

export const AppDetailModal: React.FC<AppDetailModalProps> = ({ appId }) => {
  const { state, closeDrawer, startApp, stopApp, restartApp, showToast } = useServer();
  const app = state.apps.find((a) => a.id === appId);

  if (!app) return null;

  const isRunning = app.state === 'running';

  const handleLaunchWebUi = () => {
    showToast(
      `[DEMO] Simulated WebUI for ${app.name} on port :${app.webUiPort}. Real network connections are disabled.`,
      'info'
    );
  };

  return (
    <div className="drawer-backdrop" onClick={closeDrawer} role="dialog" aria-modal="true" aria-labelledby="app-drawer-title">
      <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 'var(--radius-sm)',
                background: 'var(--accent-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent)',
              }}
            >
              <Boxes size={18} />
            </div>
            <div>
              <h3 id="app-drawer-title" style={{ fontSize: '15px', fontWeight: 700 }}>
                {app.name}
              </h3>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Docker Container · {app.version}
              </div>
            </div>
          </div>

          <button onClick={closeDrawer} className="btn-ghost" style={{ padding: 6 }} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="drawer-body">
          {/* Status & Control Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px',
              background: 'var(--bg-surface-raised)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Status</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 4 }}>
                {isRunning ? (
                  <Badge variant="healthy">Running ({app.uptime})</Badge>
                ) : app.state === 'error' ? (
                  <Badge variant="danger">Crashed (Code 128)</Badge>
                ) : (
                  <Badge variant="neutral">Standby (Stopped)</Badge>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              {isRunning ? (
                <>
                  <button
                    onClick={() => restartApp(app.id)}
                    className="btn btn-secondary btn-sm"
                    type="button"
                  >
                    <RotateCw size={12} />
                    <span>Restart</span>
                  </button>
                  <button
                    onClick={() => stopApp(app.id)}
                    className="btn btn-secondary btn-sm"
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
                  type="button"
                >
                  <Play size={12} />
                  <span>Start Container</span>
                </button>
              )}

              {app.hasWebUi && (
                <button
                  onClick={handleLaunchWebUi}
                  disabled={!isRunning}
                  className="btn btn-secondary btn-sm"
                  type="button"
                >
                  <ExternalLink size={12} />
                  <span>Web UI</span>
                </button>
              )}
            </div>
          </div>

          {/* Metrics */}
          {isRunning && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                padding: '12px',
                background: 'var(--bg-surface-raised)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                fontSize: '12px',
              }}
            >
              <div>
                <span className="text-muted">CPU Allocated:</span>{' '}
                <strong style={{ color: 'var(--text-primary)' }}>{app.cpuPercent}%</strong>
              </div>
              <div>
                <span className="text-muted">RAM Working Set:</span>{' '}
                <strong style={{ color: 'var(--text-primary)' }}>
                  {Math.round(app.memBytes / (1024 * 1024))} MB
                </strong>
              </div>
              <div>
                <span className="text-muted">Published Port:</span>{' '}
                <strong className="text-mono" style={{ color: 'var(--text-primary)' }}>
                  {app.webUiPort || 'None'}
                </strong>
              </div>
              <div>
                <span className="text-muted">Auto-Restart:</span>{' '}
                <strong style={{ color: 'var(--text-primary)' }}>unless-stopped</strong>
              </div>
            </div>
          )}

          {/* Terminal Logs */}
          <div
            style={{
              background: '#07080a',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-medium)',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
                <Terminal size={13} />
                <span>stdout / stderr</span>
              </div>
              <span className="text-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                tail -n 25
              </span>
            </div>

            <div
              className="text-mono"
              style={{
                fontSize: '11px',
                lineHeight: 1.6,
                color: '#d1d5db',
                maxHeight: '220px',
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
              }}
            >
              {app.logs && app.logs.length > 0 ? (
                app.logs.map((log, i) => (
                  <div
                    key={i}
                    style={{
                      color: log.includes('FATAL') || log.includes('Error')
                        ? 'var(--status-danger)'
                        : log.includes('WARN')
                        ? 'var(--status-warning)'
                        : 'inherit',
                    }}
                  >
                    {log}
                  </div>
                ))
              ) : (
                <div style={{ color: 'var(--text-muted)' }}>[No log output recorded]</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

