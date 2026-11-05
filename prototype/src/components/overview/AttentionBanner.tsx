import React from 'react';
import { useServer } from '../../context/ServerContext';
import { ProgressBar } from '../ui/ProgressBar';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  Pause,
  Play,
  XCircle,
  ExternalLink,
  WifiOff,
  RotateCw,
} from 'lucide-react';

export const AttentionBanner: React.FC = () => {
  const {
    state,
    openDrawer,
    pauseParityCheck,
    cancelParityCheck,
    triggerMover,
    startApp,
    setScenario,
  } = useServer();

  const { alerts, activeOperation, connectionStatus } = state;

  // 1. Connection Lost / Stale State Banner
  if (connectionStatus === 'stale') {
    return (
      <div
        className="card"
        style={{
          border: '1px solid var(--status-warning-border)',
          background: 'var(--status-warning-subtle)',
          padding: '12px 16px',
          marginBottom: '16px',
          borderRadius: 'var(--radius-md)',
        }}
        role="alert"
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '8px',
                background: 'rgba(245, 158, 11, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <WifiOff size={15} color="var(--status-warning)" />
            </div>
            <div>
              <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
                Connection Interrupted — Displaying Cached Snapshot
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginLeft: '8px' }}>
                (Last sync 18 minutes ago)
              </span>
            </div>
          </div>
          <button
            onClick={() => setScenario('healthy')}
            className="btn btn-secondary btn-sm"
            style={{ padding: '4px 10px', fontSize: '11px', gap: '5px' }}
            type="button"
          >
            <RotateCw size={12} />
            <span>Reconnect</span>
          </button>
        </div>
      </div>
    );
  }

  // 2. Active Operation (Parity Check / Mover)
  if (activeOperation) {
    return (
      <div
        className="card"
        style={{
          border: '1px solid var(--accent-border)',
          background: 'linear-gradient(90deg, rgba(255, 107, 53, 0.08) 0%, var(--bg-surface) 100%)',
          padding: '12px 16px',
          marginBottom: '12px',
          borderRadius: 'var(--radius-md)',
        }}
        role="region"
        aria-label="Active operation status"
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'var(--accent)',
                animation: activeOperation.isPaused ? 'none' : 'pulse 1.5s infinite',
              }}
            />
            <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>{activeOperation.title}</span>
            <span className="text-mono" style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 700 }}>
              {activeOperation.progressPercent}%
            </span>
            {activeOperation.speedMbps && (
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                ({activeOperation.speedMbps} MB/s · {activeOperation.estimatedRemaining} remaining)
              </span>
            )}
            {activeOperation.isPaused && (
              <span className="badge badge-warning" style={{ fontSize: '9px', padding: '1px 6px' }}>
                PAUSED
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {activeOperation.canPause && (
              <button
                onClick={pauseParityCheck}
                className="btn btn-secondary btn-sm"
                style={{ padding: '3px 8px', fontSize: '11px', height: '24px' }}
                type="button"
              >
                {activeOperation.isPaused ? <Play size={11} style={{ marginRight: 3 }} /> : <Pause size={11} style={{ marginRight: 3 }} />}
                <span>{activeOperation.isPaused ? 'Resume' : 'Pause'}</span>
              </button>
            )}

            {activeOperation.canCancel && (
              <button
                onClick={cancelParityCheck}
                className="btn btn-ghost btn-sm"
                style={{ padding: '3px 8px', fontSize: '11px', height: '24px', color: 'var(--status-danger)' }}
                type="button"
              >
                <XCircle size={12} style={{ marginRight: 3 }} />
                <span>Cancel</span>
              </button>
            )}
          </div>
        </div>

        <ProgressBar
          percent={activeOperation.progressPercent}
          variant="accent"
          mode="linear"
          height={6}
        />
      </div>
    );
  }

  // 3. Alerts (SMART Issue, Low Storage, Crash)
  if (alerts.length > 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
        {alerts.map((alert) => {
          let borderColor = 'var(--status-info-border)';
          let bgColor = 'var(--status-info-subtle)';
          let iconColor = 'var(--status-info)';
          let Icon = Info;
          if (alert.level === 'critical') {
            borderColor = 'var(--status-danger-border)';
            bgColor = 'var(--status-danger-subtle)';
            iconColor = 'var(--status-danger)';
            Icon = AlertCircle;
          } else if (alert.level === 'warning') {
            borderColor = 'var(--status-warning-border)';
            bgColor = 'var(--status-warning-subtle)';
            iconColor = 'var(--status-warning)';
            Icon = AlertTriangle;
          }

          const handleAction = () => {
            if (alert.actionId === 'run_mover') {
              triggerMover();
            } else if (alert.actionId === 'start_app_plex') {
              startApp('plex');
            } else if (alert.targetObject?.type === 'disk') {
              openDrawer({ type: 'disk', diskId: alert.targetObject.id });
            } else if (alert.targetObject?.type === 'app') {
              openDrawer({ type: 'app', appId: alert.targetObject.id });
            } else {
              openDrawer({ type: 'array_action' });
            }
          };

          return (
            <div
              key={alert.id}
              className="card"
              style={{
                border: `1px solid ${borderColor}`,
                background: bgColor,
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
              }}
              role="alert"
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 260, flex: 1 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={16} color={iconColor} />
                  </div>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
                      {alert.title}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginLeft: '8px' }}>
                      — {alert.description}
                    </span>
                  </div>
                </div>

                {alert.actionLabel && (
                  <button
                    onClick={handleAction}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '11px', padding: '3px 10px', flexShrink: 0, height: '24px' }}
                    type="button"
                  >
                    <span>{alert.actionLabel}</span>
                    <ExternalLink size={11} style={{ marginLeft: 4 }} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return null;
};
