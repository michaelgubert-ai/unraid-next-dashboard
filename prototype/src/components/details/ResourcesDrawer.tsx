import React from 'react';
import { useServer } from '../../context/ServerContext';
import { formatBytes } from '../../utils/formatters';
import { ProgressBar } from '../ui/ProgressBar';
import {
  Activity,
  Cpu,
  Database,
  ArrowUpDown,
  Tv,
  X,
  Zap,
  Flame,
  CheckCircle2,
} from 'lucide-react';

export const ResourcesDrawer: React.FC = () => {
  const { state, closeDrawer } = useServer();
  const { resources } = state;

  return (
    <div className="drawer-backdrop" onClick={closeDrawer} role="dialog" aria-modal="true" aria-labelledby="resources-drawer-title">
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
              <Activity size={18} />
            </div>
            <div>
              <h3 id="resources-drawer-title" style={{ fontSize: '15px', fontWeight: 700 }}>
                System Hardware Telemetry
              </h3>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {resources.cpuModel}
              </div>
            </div>
          </div>

          <button onClick={closeDrawer} className="btn-ghost" style={{ padding: 6 }} aria-label="Close drawer">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="drawer-body">
          {/* Per-Core CPU Breakdown */}
          <div
            style={{
              padding: '12px',
              background: 'var(--bg-surface-raised)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Cpu size={15} color="var(--accent)" />
                <span style={{ fontSize: '13px', fontWeight: 600 }}>CPU Logical Cores (16 Threads)</span>
              </div>
              <span className="text-mono" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {resources.cpuPwrWatts} W · {resources.cpuTempC}°C
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '8px',
                fontSize: '11px',
              }}
            >
              {resources.cores.map((core) => (
                <div
                  key={core.id}
                  style={{
                    background: 'var(--bg-surface-inset)',
                    padding: '6px 8px',
                    borderRadius: '4px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-muted">
                      #{core.id} ({core.type})
                    </span>
                    <span className="text-mono" style={{ fontWeight: 600 }}>
                      {core.usagePercent}%
                    </span>
                  </div>
                  <ProgressBar percent={core.usagePercent} variant="accent" height={3} />
                </div>
              ))}
            </div>
          </div>

          {/* Memory Allocation Pools */}
          <div
            style={{
              padding: '12px',
              background: 'var(--bg-surface-raised)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 10 }}>
              <Database size={15} color="var(--accent)" />
              <span style={{ fontSize: '13px', fontWeight: 600 }}>Memory Allocation (16 GiB DDR5)</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span className="text-secondary">System OS & Buffer</span>
                  <span className="text-mono">{formatBytes(resources.ramSystemBytes, 2)}</span>
                </div>
                <ProgressBar
                  percent={Math.round((resources.ramSystemBytes / resources.ramTotalBytes) * 100)}
                  variant="info"
                  height={4}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span className="text-secondary">Docker Container VDisk</span>
                  <span className="text-mono">{formatBytes(resources.ramDockerBytes, 2)}</span>
                </div>
                <ProgressBar
                  percent={Math.round((resources.ramDockerBytes / resources.ramTotalBytes) * 100)}
                  variant="accent"
                  height={4}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span className="text-secondary">Free Unallocated RAM</span>
                  <span className="text-mono">{formatBytes(resources.ramFreeBytes, 2)}</span>
                </div>
                <ProgressBar
                  percent={Math.round((resources.ramFreeBytes / resources.ramTotalBytes) * 100)}
                  variant="healthy"
                  height={4}
                />
              </div>
            </div>
          </div>

          {/* Network Interface Configuration */}
          <div
            style={{
              padding: '12px',
              background: 'var(--bg-surface-raised)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              fontSize: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ArrowUpDown size={15} color="var(--accent)" />
                <span style={{ fontSize: '13px', fontWeight: 600 }}>Network Interface</span>
              </div>
              <span className="badge badge-healthy" style={{ fontSize: '10px' }}>
                Connected
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-muted">Active Interface:</span>
                <span className="text-mono">{resources.network.interfaceName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-muted">Link Speed & Duplex:</span>
                <span className="text-mono">1 Gbps Full Duplex (MTU 1500)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-muted">Server IP Address:</span>
                <span className="text-mono">{resources.network.ipAddress}</span>
              </div>
            </div>
          </div>

          {/* Dedicated GPU Details */}
          {resources.gpu && (
            <div
              style={{
                padding: '12px',
                background: 'var(--bg-surface-raised)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                fontSize: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Tv size={15} color="var(--accent)" />
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>Discrete Graphics Card</span>
                </div>
                <span className="badge badge-neutral" style={{ fontSize: '10px' }}>
                  P8 Idle
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-muted">Model:</span>
                  <span className="text-mono">{resources.gpu.model}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-muted">NVIDIA Driver:</span>
                  <span className="text-mono">{resources.gpu.driverVersion}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-muted">Power Consumption:</span>
                  <span className="text-mono">{resources.gpu.powerWatts} W</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-muted">GPU Core Temp:</span>
                  <span className="text-mono">{resources.gpu.tempC}°C</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

