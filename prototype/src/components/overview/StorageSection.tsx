import React, { useState } from 'react';
import { useServer } from '../../context/ServerContext';
import { formatBytes, formatPercent } from '../../utils/formatters';
import { ProgressBar } from '../ui/ProgressBar';
import { Badge } from '../ui/Badge';
import {
  HardDrive,
  Shield,
  Zap,
  ChevronDown,
  ChevronRight,
  Disc,
  Power,
  ExternalLink,
  FolderSync,
  AlertTriangle,
} from 'lucide-react';
import { DiskDevice } from '../../types/server';

export const StorageSection: React.FC = () => {
  const { state, openDrawer, toggleDiskSpin } = useServer();
  const { array, cache, bootDevice, unassignedShares } = state.storage;

  const [showArrayDisks, setShowArrayDisks] = useState<boolean>(false);
  const [showCacheDisks, setShowCacheDisks] = useState<boolean>(false);

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
        className="disk-row"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 12px',
          background: 'var(--bg-surface-inset)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          cursor: 'pointer',
          transition: 'all var(--transition-fast)',
          gap: '8px',
          flexWrap: 'wrap',
        }}
        onClick={() => openDrawer({ type: 'disk', diskId: disk.id })}
        role="button"
        tabIndex={0}
        aria-label={`View details for ${disk.name}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            openDrawer({ type: 'disk', diskId: disk.id });
          }
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '180px' }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-sm)',
              background: isParity ? 'rgba(59, 130, 246, 0.12)' : 'var(--bg-surface-raised)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isParity ? 'var(--status-info)' : 'var(--text-secondary)',
            }}
          >
            {isParity ? <Shield size={16} /> : <HardDrive size={16} />}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 600, fontSize: '13px' }}>{disk.name}</span>
              <span className="text-mono text-muted" style={{ fontSize: '11px' }}>
                {disk.devicePath}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {disk.model} · {formatBytes(disk.sizeBytes, 0)}
            </div>
          </div>
        </div>

        {/* Status, Temp & Error count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {disk.errorCount > 0 ? (
            <Badge variant="danger">
              <AlertTriangle size={11} style={{ marginRight: 2 }} />
              {disk.errorCount} Errors
            </Badge>
          ) : !disk.smartHealthy ? (
            <Badge variant="warning">SMART Alert</Badge>
          ) : isStandby ? (
            <Badge variant="neutral">Standby</Badge>
          ) : (
            <Badge variant="healthy">Active</Badge>
          )}

          <div style={{ fontSize: '12px', minWidth: '45px', textAlign: 'right' }}>
            {disk.temperatureC !== null ? (
              <span
                style={{
                  color: disk.temperatureC > 45 ? 'var(--status-warning)' : 'var(--text-secondary)',
                  fontWeight: 500,
                }}
              >
                {disk.temperatureC}°C
              </span>
            ) : (
              <span className="text-muted">—</span>
            )}
          </div>

          {!isParity && disk.fileSystem && (
            <span
              className="text-mono"
              style={{
                fontSize: '11px',
                color: 'var(--text-muted)',
                background: 'var(--bg-surface-raised)',
                padding: '2px 6px',
                borderRadius: '4px',
              }}
            >
              {disk.fileSystem.toUpperCase()}
            </span>
          )}

          {/* Disk spin action button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleDiskSpin(disk.id);
            }}
            className="btn btn-secondary btn-sm"
            style={{ padding: '3px 7px', fontSize: '11px' }}
            title={isStandby ? 'Spin up device' : 'Spin down device'}
            type="button"
          >
            <Power size={11} color={isStandby ? 'var(--text-muted)' : 'var(--status-healthy)'} />
            <span>{isStandby ? 'Spin Up' : 'Spin Down'}</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <section className="card" style={{ marginBottom: 'var(--space-md)' }} aria-labelledby="storage-title">
      <div className="card-header">
        <div className="card-title-group">
          <HardDrive size={18} color="var(--accent)" />
          <div>
            <h2 id="storage-title" className="card-title">
              Storage Architecture
            </h2>
            <div className="card-subtitle">
              Protected Array ({formatBytes(array.totalBytes, 0)}) + NVMe Cache ({formatBytes(cache.totalBytes, 0)})
            </div>
          </div>
        </div>

        <button
          onClick={() => openDrawer({ type: 'array_action' })}
          className="btn btn-ghost btn-sm"
          type="button"
        >
          <span>Operations</span>
          <ExternalLink size={12} />
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
        {/* 1. Protected Data Array Card */}
        <div
          style={{
            background: 'var(--bg-surface-raised)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-md)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={16} color="var(--status-healthy)" />
              <span style={{ fontWeight: 600, fontSize: '13px' }}>Protected Array</span>
              <span className="badge badge-healthy" style={{ fontSize: '10px' }}>
                Parity Protected
              </span>
            </div>
            <span className="text-mono" style={{ fontSize: '12px', fontWeight: 600 }}>
              {arrayPercent}% used
            </span>
          </div>

          {/* Segmented meter (Catalyst inspired) */}
          <ProgressBar
            percent={arrayPercent}
            variant={arrayVariant}
            mode="segmented"
            segmentCount={24}
            height={16}
          />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '11px',
              color: 'var(--text-secondary)',
              marginTop: '8px',
            }}
          >
            <span>
              Used: <strong style={{ color: 'var(--text-primary)' }}>{formatBytes(array.usedBytes, 2)}</strong>
            </span>
            <span>
              Free: <strong style={{ color: 'var(--text-primary)' }}>{formatBytes(array.freeBytes, 2)}</strong>
            </span>
            <span>
              Usable: <strong style={{ color: 'var(--text-primary)' }}>{formatBytes(array.totalBytes, 0)}</strong>
            </span>
          </div>

          {/* Toggle inline Array Disks */}
          <button
            onClick={() => setShowArrayDisks(!showArrayDisks)}
            className="btn btn-ghost btn-sm"
            style={{ width: '100%', marginTop: '12px', justifyContent: 'space-between', padding: '6px 8px' }}
            type="button"
            aria-expanded={showArrayDisks}
          >
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {showArrayDisks ? 'Hide Disks' : `Inspect ${array.devices.length} Array Disks`}
            </span>
            {showArrayDisks ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>

          {showArrayDisks && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' }}>
              {array.devices.map(renderDiskRow)}
            </div>
          )}
        </div>

        {/* 2. Fast NVMe Cache Pool Card */}
        <div
          style={{
            background: 'var(--bg-surface-raised)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-md)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={16} color="var(--accent)" />
              <span style={{ fontWeight: 600, fontSize: '13px' }}>NVMe Cache Pool</span>
              <span className="badge badge-accent" style={{ fontSize: '10px' }}>
                M.2 Btrfs
              </span>
            </div>
            <span className="text-mono" style={{ fontSize: '12px', fontWeight: 600 }}>
              {cachePercent}% used
            </span>
          </div>

          <ProgressBar
            percent={cachePercent}
            variant={cacheVariant}
            mode="segmented"
            segmentCount={24}
            height={16}
          />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '11px',
              color: 'var(--text-secondary)',
              marginTop: '8px',
            }}
          >
            <span>
              Used: <strong style={{ color: 'var(--text-primary)' }}>{formatBytes(cache.usedBytes, 1)}</strong>
            </span>
            <span>
              Free: <strong style={{ color: 'var(--text-primary)' }}>{formatBytes(cache.freeBytes, 1)}</strong>
            </span>
            <span>
              Total: <strong style={{ color: 'var(--text-primary)' }}>{formatBytes(cache.totalBytes, 0)}</strong>
            </span>
          </div>

          {/* Toggle inline Cache Disks */}
          <button
            onClick={() => setShowCacheDisks(!showCacheDisks)}
            className="btn btn-ghost btn-sm"
            style={{ width: '100%', marginTop: '12px', justifyContent: 'space-between', padding: '6px 8px' }}
            type="button"
            aria-expanded={showCacheDisks}
          >
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {showCacheDisks ? 'Hide Device' : `Inspect Cache Device (NVMe)`}
            </span>
            {showCacheDisks ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>

          {showCacheDisks && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' }}>
              {cache.devices.map(renderDiskRow)}
            </div>
          )}
        </div>
      </div>

      {/* Sub-bar: Boot Key & Remote Mounts */}
      <div
        style={{
          marginTop: '12px',
          paddingTop: '10px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          fontSize: '11px',
          color: 'var(--text-muted)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Disc size={13} />
          <span>Boot Key:</span>
          <span style={{ color: 'var(--text-primary)' }}>{bootDevice.model}</span>
          <span className="text-mono">({formatBytes(bootDevice.usedBytes, 1)} / {formatBytes(bootDevice.sizeBytes, 0)})</span>
        </div>

        {unassignedShares.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FolderSync size={13} />
            <span>Remote Mount:</span>
            <span style={{ color: 'var(--text-primary)' }}>{unassignedShares[0].name}</span>
            <span className="badge badge-neutral" style={{ fontSize: '9px', padding: '1px 5px' }}>
              SMB RO
            </span>
            <span className="text-mono">
              ({formatBytes(unassignedShares[0].usedBytes, 1)} / {formatBytes(unassignedShares[0].totalBytes, 1)})
            </span>
          </div>
        )}
      </div>
    </section>
  );
};

