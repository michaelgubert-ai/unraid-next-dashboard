import React from 'react';
import { useServer } from '../../context/ServerContext';
import { formatBytes, formatRate } from '../../utils/formatters';
import { Badge } from '../ui/Badge';
import {
  HardDrive,
  Shield,
  Zap,
  Power,
  X,
  AlertTriangle,
  CheckCircle2,
  Activity,
  FileCode,
  Thermometer,
} from 'lucide-react';

interface DiskDetailDrawerProps {
  diskId: string;
}

export const DiskDetailDrawer: React.FC<DiskDetailDrawerProps> = ({ diskId }) => {
  const { state, closeDrawer, toggleDiskSpin, showToast } = useServer();

  // Find disk across array and cache
  const allDisks = [
    ...state.storage.array.devices,
    ...state.storage.cache.devices,
    state.storage.bootDevice,
  ];
  const disk = allDisks.find((d) => d.id === diskId);

  if (!disk) return null;

  const isStandby = disk.spinState === 'standby';
  const isParity = disk.role === 'parity';

  const handleSmartTest = () => {
    showToast(`SMART self-test initiated for ${disk.name} (Simulated).`, 'info');
  };

  return (
    <div className="drawer-backdrop" onClick={closeDrawer} role="dialog" aria-modal="true" aria-labelledby="disk-drawer-title">
      <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 'var(--radius-sm)',
                background: isParity ? 'rgba(59, 130, 246, 0.14)' : 'var(--bg-surface-raised)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isParity ? 'var(--status-info)' : 'var(--text-secondary)',
              }}
            >
              {isParity ? <Shield size={18} /> : <HardDrive size={18} />}
            </div>
            <div>
              <h3 id="disk-drawer-title" style={{ fontSize: '15px', fontWeight: 700 }}>
                {disk.name}
              </h3>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {disk.devicePath} · {disk.model}
              </div>
            </div>
          </div>

          <button onClick={closeDrawer} className="btn-ghost" style={{ padding: 6 }} aria-label="Close details">
            <X size={18} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="drawer-body">
          {/* Status Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px',
              background: 'var(--bg-surface-raised)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Power / Spin Status</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 4 }}>
                {isStandby ? (
                  <Badge variant="neutral">Spun Down (Standby)</Badge>
                ) : (
                  <Badge variant="healthy">Active & Spinning</Badge>
                )}
                {disk.errorCount > 0 && <Badge variant="danger">{disk.errorCount} Errors</Badge>}
              </div>
            </div>

            <button
              onClick={() => toggleDiskSpin(disk.id)}
              className="btn btn-secondary btn-sm"
              type="button"
            >
              <Power size={13} color={isStandby ? 'var(--text-muted)' : 'var(--status-healthy)'} />
              <span>{isStandby ? 'Spin Up' : 'Spin Down'}</span>
            </button>
          </div>

          {/* SMART Diagnostics */}
          <div
            style={{
              padding: '12px',
              background: 'var(--bg-surface-raised)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: '12px', fontWeight: 600 }}>SMART Health Status</span>
              {disk.smartHealthy ? (
                <span className="badge badge-healthy" style={{ fontSize: '11px' }}>
                  <CheckCircle2 size={12} style={{ marginRight: 2 }} />
                  Passed
                </span>
              ) : (
                <span className="badge badge-danger" style={{ fontSize: '11px' }}>
                  <AlertTriangle size={12} style={{ marginRight: 2 }} />
                  Degraded
                </span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <div>Temperature: <strong style={{ color: 'var(--text-primary)' }}>{disk.temperatureC ? `${disk.temperatureC}°C` : 'Standby'}</strong></div>
              <div>Sector Errors: <strong style={{ color: disk.errorCount > 0 ? 'var(--status-danger)' : 'var(--text-primary)' }}>{disk.errorCount}</strong></div>
              <div>Read Rate: <strong style={{ color: 'var(--text-primary)' }}>{formatRate(disk.readRateBytes)}</strong></div>
              <div>Write Rate: <strong style={{ color: 'var(--text-primary)' }}>{formatRate(disk.writeRateBytes)}</strong></div>
            </div>

            <button
              onClick={handleSmartTest}
              className="btn btn-ghost btn-sm"
              style={{ width: '100%', marginTop: '10px', fontSize: '11px', border: '1px dashed var(--border-medium)' }}
              type="button"
            >
              Run Short SMART Self-Test (Simulated)
            </button>
          </div>

          {/* Hardware & Partition Details */}
          <div
            style={{
              padding: '12px',
              background: 'var(--bg-surface-raised)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              fontSize: '12px',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>
              Hardware Identification
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-muted">Model:</span>
                <span className="text-primary font-mono">{disk.model}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-muted">Serial Number:</span>
                <span className="text-primary font-mono">{disk.serial}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-muted">Device Path:</span>
                <span className="text-primary font-mono">{disk.devicePath}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-muted">Raw Capacity:</span>
                <span className="text-primary font-mono">{formatBytes(disk.sizeBytes, 2)}</span>
              </div>
              {disk.fileSystem && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-muted">File System:</span>
                  <span className="text-primary font-mono">{disk.fileSystem.toUpperCase()}</span>
                </div>
              )}
              {disk.mountPoint && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-muted">Mount Point:</span>
                  <span className="text-primary font-mono">{disk.mountPoint}</span>
                </div>
              )}
            </div>
          </div>

          {/* I/O Lifetime Statistics */}
          <div
            style={{
              padding: '12px',
              background: 'var(--bg-surface-raised)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              fontSize: '12px',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>
              Lifetime I/O Counters
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span className="text-muted">Cumulative Reads:</span>
              <span className="text-mono">{disk.totalReads.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="text-muted">Cumulative Writes:</span>
              <span className="text-mono">{disk.totalWrites.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

