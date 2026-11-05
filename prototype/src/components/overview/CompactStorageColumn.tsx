import React from 'react';
import { useServer } from '../../context/ServerContext';
import { formatBytes, formatPercent } from '../../utils/formatters';
import { ProgressBar } from '../ui/ProgressBar';
import { Badge } from '../ui/Badge';
import {
  HardDrive,
  Shield,
  Zap,
  Power,
  Sliders,
  Disc,
  FolderSync,
  AlertTriangle,
} from 'lucide-react';
import { DiskDevice } from '../../types/server';

export const CompactStorageColumn: React.FC = () => {
  const { state, openDrawer, toggleDiskSpin } = useServer();
  const { array, cache, bootDevice, unassignedShares } = state.storage;

  const arrayPercent = formatPercent(array.usedBytes, array.totalBytes);
  const cachePercent = formatPercent(cache.usedBytes, cache.totalBytes);

  let arrayVariant: 'accent' | 'healthy' | 'warning' | 'danger' = 'accent';
  if (arrayPercent >= 90) arrayVariant = 'warning';
  if (array.status === 'warning') arrayVariant = 'warning';

  let cacheVariant: 'accent' | 'healthy' | 'warning' | 'danger' = 'accent';
  if (cachePercent >= 90) cacheVariant = 'warning';

  const renderDiskRow = (disk: DiskDevice) => {
    const isParity = disk.role === 'parity';
    const isStandby = disk.spinState === 'standby';

    return (
      <div
        key={disk.id}
        className="compact-disk-row"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 8px',
          background: 'var(--bg-surface-inset)',
          borderRadius: 'var(--radius-xs)',
          border: '1px solid var(--border-subtle)',
          fontSize: '11px',
          cursor: 'pointer',
          transition: 'all var(--transition-fast)',
          gap: '6px',
        }}
        onClick={() => openDrawer({ type: 'disk', diskId: disk.id })}
        role="button"
        tabIndex={0}
        aria-label={`View diagnostics for ${disk.name}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            openDrawer({ type: 'disk', diskId: disk.id });
          }
        }}
      >
        {/* Left: Icon, Name & Path */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flex: 1, overflow: 'hidden' }}>
          <div
            style={{
              color: isParity ? 'var(--status-info)' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
            }}
          >
            {isParity ? <Shield size={13} /> : <HardDrive size={13} />}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', minWidth: 0, overflow: 'hidden' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {disk.name}
            </span>
            <span className="text-mono text-muted hide-on-narrow" style={{ fontSize: '10px', flexShrink: 0 }}>
              {disk.devicePath}
            </span>
          </div>
        </div>

        {/* Right: Temp, Status & Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {disk.errorCount > 0 ? (
            <Badge variant="danger" showDot={true} className="disk-badge-compact">
              {disk.errorCount} Err
            </Badge>
          ) : !disk.smartHealthy ? (
            <Badge variant="warning" showDot={true} className="disk-badge-compact">
              SMART
            </Badge>
          ) : isStandby ? (
            <span className="text-muted" style={{ fontSize: '10px' }}>Standby</span>
          ) : (
            <span style={{ color: 'var(--status-healthy)', fontSize: '10px' }}>Active</span>
          )}

          <span
            className="text-mono"
            style={{
              minWidth: '32px',
              textAlign: 'right',
              fontSize: '10px',
              color: disk.temperatureC && disk.temperatureC > 45 ? 'var(--status-warning)' : 'var(--text-muted)',
            }}
          >
            {disk.temperatureC ? `${disk.temperatureC}°C` : '—'}
          </span>

          {disk.fileSystem && (
            <span
              className="text-mono hide-on-narrow"
              style={{
                fontSize: '9px',
                color: 'var(--text-muted)',
                background: 'var(--bg-surface-raised)',
                padding: '1px 4px',
                borderRadius: '2px',
              }}
            >
              {disk.fileSystem.toUpperCase()}
            </span>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleDiskSpin(disk.id);
            }}
            className="btn btn-secondary btn-sm"
            style={{ padding: '2px 5px', fontSize: '10px', height: '20px' }}
            title={isStandby ? 'Spin up device' : 'Spin down device'}
            type="button"
          >
            <Power size={10} color={isStandby ? 'var(--text-muted)' : 'var(--status-healthy)'} />
          </button>
        </div>
      </div>
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
      aria-label="Storage Status"
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <HardDrive size={15} color="var(--accent)" />
          <span style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '-0.01em' }}>Storage</span>
          <span className="text-muted" style={{ fontSize: '11px' }}>
            ({formatBytes(array.totalBytes, 0)} Usable + {formatBytes(cache.totalBytes, 0)} Cache)
          </span>
        </div>

        <button
          onClick={() => openDrawer({ type: 'array_action' })}
          className="btn btn-ghost btn-sm"
          style={{ padding: '2px 6px', fontSize: '11px', color: 'var(--text-muted)' }}
          type="button"
        >
          <Sliders size={11} style={{ marginRight: 3 }} />
          <span>Operations</span>
        </button>
      </div>

      {/* 1. Protected Data Array */}
      <div
        style={{
          background: 'var(--bg-surface-raised)',
          borderRadius: 'var(--radius-sm)',
          padding: '8px 10px',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Shield size={12} color="var(--status-healthy)" />
            <span style={{ fontWeight: 600 }}>Protected Array</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>(2 Disks + Parity)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>{formatBytes(array.usedBytes, 2)}</strong> / {formatBytes(array.totalBytes, 0)}
            </span>
            <span className="text-mono" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
              {arrayPercent}%
            </span>
          </div>
        </div>

        {/* Catalyst Segmented Meter */}
        <ProgressBar
          percent={arrayPercent}
          variant={arrayVariant}
          mode="segmented"
          segmentCount={22}
          height={12}
        />

        {/* Compact Array Disks List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '2px' }}>
          {array.devices.map(renderDiskRow)}
        </div>
      </div>

      {/* 2. NVMe Cache Pool */}
      <div
        style={{
          background: 'var(--bg-surface-raised)',
          borderRadius: 'var(--radius-sm)',
          padding: '8px 10px',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={12} color="var(--accent)" />
            <span style={{ fontWeight: 600 }}>Fast NVMe Cache</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>(M.2 Btrfs)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>{formatBytes(cache.usedBytes, 1)}</strong> / {formatBytes(cache.totalBytes, 0)}
            </span>
            <span className="text-mono" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
              {cachePercent}%
            </span>
          </div>
        </div>

        <ProgressBar
          percent={cachePercent}
          variant={cacheVariant}
          mode="segmented"
          segmentCount={22}
          height={12}
        />

        {/* Compact Cache Device */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '2px' }}>
          {cache.devices.map(renderDiskRow)}
        </div>
      </div>

      {/* 3. Sub-footer: Boot Key & Remote Share */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '10px',
          color: 'var(--text-muted)',
          paddingTop: '4px',
          borderTop: '1px solid var(--border-subtle)',
          flexWrap: 'wrap',
          gap: '6px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Disc size={11} />
          <span>Boot:</span>
          <span style={{ color: 'var(--text-secondary)' }}>{bootDevice.model}</span>
          <span className="text-mono">({formatBytes(bootDevice.usedBytes, 1)})</span>
        </div>

        {unassignedShares.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <FolderSync size={11} />
            <span>Remote:</span>
            <span style={{ color: 'var(--text-secondary)' }}>{unassignedShares[0].name}</span>
            <span className="text-mono">({formatBytes(unassignedShares[0].usedBytes, 1)} / {formatBytes(unassignedShares[0].totalBytes, 0)})</span>
          </div>
        )}
      </div>
    </div>
  );
};
